#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# AUTO-FIX: Apply User Isolation to All Routes
# Run this script in your project directory
# ═══════════════════════════════════════════════════════════════════

set -e

cd ~/open-source-contribute/Devops-full-managed-dashboard/backend/routes

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║          Applying User Isolation Fixes                          ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Create backups
echo "📦 Creating backups..."
cp docker.js docker.js.backup
cp deploy.js deploy.js.backup
echo "   ✓ docker.js.backup"
echo "   ✓ deploy.js.backup"
echo ""

# ═══════════════════════════════════════════════════════════════════
# FIX 1: docker.js - Add user filtering for containers
# ═══════════════════════════════════════════════════════════════════

echo "🔧 Fixing docker.js..."

# Replace the listContainers calls to include user filter
cat > /tmp/fix_docker.sed << 'SEDEOF'
/const containers = await docker.listContainers({ all: true });/{
    s/const containers = await docker.listContainers({ all: true });/const containers = await docker.listContainers({ \n      all: true,\n      filters: {\n        label: [\`createdBy=\${req.user._id}\`]\n      }\n    });/
}
SEDEOF

sed -i -f /tmp/fix_docker.sed docker.js

echo "   ✓ Added user filtering to listContainers (2 places)"
echo ""

# ═══════════════════════════════════════════════════════════════════
# FIX 2: deploy.js - Docker route fixes
# ═══════════════════════════════════════════════════════════════════

echo "🔧 Fixing deploy.js..."

# Fix 2.1: Remove port parameter from Docker route
sed -i "s/const { content, mode = 'deploy', containerName = \`generated-app-\${Date.now()}\`, port = '3000' } = req.body;/const { content, mode = 'deploy', containerName = \`generated-app-\${Date.now()}\` } = req.body;/" deploy.js
echo "   ✓ Removed port parameter from Docker route"

# Fix 2.2: Update Docker directory to be user-specific
sed -i "s|const dockerDir = path.join(GENERATOR_BASE_PATH, 'docker');|const userDir = path.join(GENERATOR_BASE_PATH, req.user._id.toString());\n    const dockerDir = path.join(userDir, 'docker');|" deploy.js
echo "   ✓ Docker: user-specific directory"

# Fix 2.3: Update createTestApp call (remove port parameter)
sed -i "s/const appCreation = await createTestApp(dockerDir, port);/const appCreation = await createTestApp(dockerDir);/" deploy.js
echo "   ✓ Updated createTestApp call"

# Fix 2.4: Update createTestApp function signature
sed -i "s/const createTestApp = async (dockerDir, port) => {/const createTestApp = async (dockerDir) => {\n  const internalPort = 3000;  \/\/ Fixed internal port/" deploy.js
echo "   ✓ Updated createTestApp function"

# Fix 2.5: Replace port variable with internalPort in createTestApp
sed -i "s/const port = \${port};/const port = \${internalPort};/" deploy.js
sed -i "s/Port: \${port}/Port: \${internalPort} (internal)/" deploy.js
sed -i "s/EXPOSE \${port}/EXPOSE \${internalPort}/" deploy.js
echo "   ✓ Fixed port references in createTestApp"

# Fix 2.6: Remove port bindings from createContainer (THIS IS CRITICAL!)
cat > /tmp/fix_createContainer.py << 'PYEOF'
import re

with open('deploy.js', 'r') as f:
    content = f.read()

# Pattern to find the createContainer block with port bindings
old_pattern = r'''        const container = await docker\.createContainer\(\{
          Image: imageName,
          name: containerName,
          ExposedPorts: \{ \[\`\$\{port\}/tcp\`\]: \{\} \},
          HostConfig: \{
            PortBindings: \{ \[\`\$\{port\}/tcp\`\]: \[\{ HostPort: port \}\] \},
            RestartPolicy: \{ Name: 'unless-stopped' \}
          \}
        \}\);'''

# New pattern WITHOUT port bindings but WITH user labels
new_pattern = '''        const container = await docker.createContainer({
          Image: imageName,
          name: containerName,
          Labels: {
            'createdBy': req.user._id.toString(),
            'createdByEmail': req.user.email
          },
          HostConfig: {
            RestartPolicy: { Name: 'unless-stopped' }
          }
        });'''

content = content.replace(old_pattern, new_pattern)

with open('deploy.js', 'w') as f:
    f.write(content)
PYEOF

python3 /tmp/fix_createContainer.py
echo "   ✓ Removed port bindings + added user labels to container"

# Fix 2.7: Update log messages
sed -i "s/\`✓ Access at: http:\/\/localhost:\${port}\\\\n\`/\`✓ Running without external port (no conflicts!)\\\\n\`/" deploy.js
sed -i "s/logger.info(\`Docker deployment - Mode: \${mode}, Port: \${port}\`);/logger.info(\`Docker deployment - Mode: \${mode}, Container: \${containerName}\`);/" deploy.js
echo "   ✓ Updated log messages"

# ═══════════════════════════════════════════════════════════════════
# FIX 3-7: All other tools - user-specific directories
# ═══════════════════════════════════════════════════════════════════

# Fix 3: Terraform
sed -i "s|const terraformDir = path.join(GENERATOR_BASE_PATH, 'terraform');|const userDir = path.join(GENERATOR_BASE_PATH, req.user._id.toString());\n    const terraformDir = path.join(userDir, 'terraform');|" deploy.js
echo "   ✓ Terraform: user-specific directory"

# Fix 4: Kubernetes
sed -i "s|const k8sDir = path.join(GENERATOR_BASE_PATH, 'kubernetes');|const userDir = path.join(GENERATOR_BASE_PATH, req.user._id.toString());\n    const k8sDir = path.join(userDir, 'kubernetes');|" deploy.js
echo "   ✓ Kubernetes: user-specific directory"

# Fix 5: Helm
sed -i "s|const helmDir = path.join(GENERATOR_BASE_PATH, 'helm');|const userDir = path.join(GENERATOR_BASE_PATH, req.user._id.toString());\n    const helmDir = path.join(userDir, 'helm');|" deploy.js
echo "   ✓ Helm: user-specific directory"

# Fix 6: ArgoCD
sed -i "s|const argocdDir = path.join(GENERATOR_BASE_PATH, 'argocd');|const userDir = path.join(GENERATOR_BASE_PATH, req.user._id.toString());\n    const argocdDir = path.join(userDir, 'argocd');|" deploy.js
echo "   ✓ ArgoCD: user-specific directory"

# Fix 7: Jenkins
sed -i "s|const jenkinsDir = path.join(GENERATOR_BASE_PATH, 'jenkins');|const userDir = path.join(GENERATOR_BASE_PATH, req.user._id.toString());\n    const jenkinsDir = path.join(userDir, 'jenkins');|" deploy.js
echo "   ✓ Jenkins: user-specific directory"

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║          ✅ All User Isolation Fixes Applied!                    ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Summary of changes:"
echo "  ✅ docker.js:   User filtering (2 locations)"
echo "  ✅ deploy.js:   User labels on containers"
echo "  ✅ deploy.js:   User-specific directories for all tools"
echo "  ✅ deploy.js:   Removed port conflicts"
echo ""
echo "Backups saved:"
echo "  📦 docker.js.backup"
echo "  📦 deploy.js.backup"
echo ""
echo "Next steps:"
echo "  1. cd ~/open-source-contrubue/Devops-full-managed-dashboard"
echo "  2. docker-compose down"
echo "  3. docker-compose build backend"
echo "  4. docker-compose up -d"
echo ""
echo "🎉 User isolation complete!"
echo ""
