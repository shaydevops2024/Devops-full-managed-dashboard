// backend/utils/manifestGenerator.js
const yaml = require('js-yaml');

class ManifestGenerator {
  generateDockerfile(params) {
    const {
      baseImage = 'ubuntu:latest',
      workdir = '/app',
      expose = [],
      environment = {},
      commands = [],
      entrypoint = '',
      copyFiles = []
    } = params;

    let dockerfile = `# Generated Dockerfile\nFROM ${baseImage}\n\n`;
    
    if (workdir) {
      dockerfile += `WORKDIR ${workdir}\n\n`;
    }

    if (Object.keys(environment).length > 0) {
      dockerfile += '# Environment variables\n';
      Object.entries(environment).forEach(([key, value]) => {
        dockerfile += `ENV ${key}=${value}\n`;
      });
      dockerfile += '\n';
    }

    if (copyFiles.length > 0) {
      dockerfile += '# Copy files\n';
      copyFiles.forEach(file => {
        dockerfile += `COPY ${file.source} ${file.destination}\n`;
      });
      dockerfile += '\n';
    }

    if (commands.length > 0) {
      dockerfile += '# Run commands\n';
      commands.forEach(cmd => {
        dockerfile += `RUN ${cmd}\n`;
      });
      dockerfile += '\n';
    }

    if (expose.length > 0) {
      dockerfile += '# Expose ports\n';
      expose.forEach(port => {
        dockerfile += `EXPOSE ${port}\n`;
      });
      dockerfile += '\n';
    }

    if (entrypoint) {
      dockerfile += `ENTRYPOINT ${entrypoint}\n`;
    }

    return dockerfile;
  }

  generateKubernetesDeployment(params) {
    const {
      name = 'app',
      namespace = 'default',
      replicas = 1,
      image = 'nginx:latest',
      containerPort = 80,
      env = [],
      volumes = [],
      volumeMounts = [],
      resources = {},
      labels = {}
    } = params;

    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name,
        namespace,
        labels: { app: name, ...labels }
      },
      spec: {
        replicas,
        selector: {
          matchLabels: { app: name }
        },
        template: {
          metadata: {
            labels: { app: name }
          },
          spec: {
            containers: [{
              name,
              image,
              ports: [{ containerPort }],
              ...(env.length > 0 && { env }),
              ...(volumeMounts.length > 0 && { volumeMounts }),
              ...(Object.keys(resources).length > 0 && { resources })
            }],
            ...(volumes.length > 0 && { volumes })
          }
        }
      }
    };

    return yaml.dump(deployment);
  }

  generateKubernetesService(params) {
    const {
      name = 'app-service',
      namespace = 'default',
      type = 'ClusterIP',
      port = 80,
      targetPort = 80,
      selector = {}
    } = params;

    const service = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name,
        namespace
      },
      spec: {
        type,
        selector: { app: name.replace('-service', ''), ...selector },
        ports: [{
          port,
          targetPort,
          protocol: 'TCP'
        }]
      }
    };

    return yaml.dump(service);
  }

  generateKubernetesConfigMap(params) {
    const {
      name = 'app-config',
      namespace = 'default',
      data = {}
    } = params;

    const configMap = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name,
        namespace
      },
      data
    };

    return yaml.dump(configMap);
  }

  generateKubernetesSecret(params) {
    const {
      name = 'app-secret',
      namespace = 'default',
      type = 'Opaque',
      data = {}
    } = params;

    const secret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name,
        namespace
      },
      type,
      data // Should be base64 encoded
    };

    return yaml.dump(secret);
  }

  generateKubernetesIngress(params) {
    const {
      name = 'app-ingress',
      namespace = 'default',
      host = 'example.com',
      serviceName = 'app-service',
      servicePort = 80,
      tls = false,
      tlsSecretName = ''
    } = params;

    const ingress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name,
        namespace
      },
      spec: {
        rules: [{
          host,
          http: {
            paths: [{
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: serviceName,
                  port: { number: servicePort }
                }
              }
            }]
          }
        }]
      }
    };

    if (tls && tlsSecretName) {
      ingress.spec.tls = [{
        hosts: [host],
        secretName: tlsSecretName
      }];
    }

    return yaml.dump(ingress);
  }

  generateTerraformMain(params) {
    const {
      provider = 'aws',
      region = 'us-east-1',
      resources = []
    } = params;

    let terraform = `# Generated Terraform Configuration\n\n`;
    terraform += `terraform {\n  required_version = ">= 1.0"\n}\n\n`;
    terraform += `provider "${provider}" {\n  region = "${region}"\n}\n\n`;

    resources.forEach(resource => {
      terraform += `resource "${resource.type}" "${resource.name}" {\n`;
      Object.entries(resource.attributes || {}).forEach(([key, value]) => {
        terraform += `  ${key} = "${value}"\n`;
      });
      terraform += `}\n\n`;
    });

    return terraform;
  }

  generateHelmChart(params) {
    const {
      name = 'myapp',
      version = '0.1.0',
      appVersion = '1.0.0',
      description = 'A Helm chart for Kubernetes'
    } = params;

    const chart = {
      apiVersion: 'v2',
      name,
      description,
      type: 'application',
      version,
      appVersion
    };

    return yaml.dump(chart);
  }

  generateHelmValues(params) {
    const {
      replicaCount = 1,
      image = { repository: 'nginx', tag: 'latest', pullPolicy: 'IfNotPresent' },
      service = { type: 'ClusterIP', port: 80 },
      ingress = { enabled: false },
      resources = {}
    } = params;

    const values = {
      replicaCount,
      image,
      service,
      ingress,
      resources
    };

    return yaml.dump(values);
  }

  generateAnsiblePlaybook(params) {
    const {
      name = 'Configure servers',
      hosts = 'all',
      becomeUser = true,
      tasks = []
    } = params;

    const playbook = [{
      name,
      hosts,
      become: becomeUser,
      tasks: tasks.length > 0 ? tasks : [
        {
          name: 'Example task',
          debug: {
            msg: 'Hello from Ansible'
          }
        }
      ]
    }];

    return yaml.dump(playbook);
  }

  generateDockerCompose(params) {
    const {
      version = '3.8',
      services = {}
    } = params;

    const compose = {
      version,
      services
    };

    return yaml.dump(compose);
  }

  generateJenkinsfile(params) {
    const {
      agent = 'any',
      stages = []
    } = params;

    let jenkinsfile = `pipeline {\n  agent ${agent}\n\n  stages {\n`;
    
    stages.forEach(stage => {
      jenkinsfile += `    stage('${stage.name}') {\n      steps {\n`;
      stage.steps.forEach(step => {
        jenkinsfile += `        ${step}\n`;
      });
      jenkinsfile += `      }\n    }\n`;
    });
    
    jenkinsfile += `  }\n}\n`;

    return jenkinsfile;
  }

  generateArgoCD(params) {
    const {
      name = 'myapp',
      namespace = 'default',
      repoURL = 'https://github.com/example/repo',
      path = '.',
      targetRevision = 'HEAD',
      destinationServer = 'https://kubernetes.default.svc',
      destinationNamespace = 'default'
    } = params;

    const application = {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Application',
      metadata: {
        name,
        namespace
      },
      spec: {
        project: 'default',
        source: {
          repoURL,
          targetRevision,
          path
        },
        destination: {
          server: destinationServer,
          namespace: destinationNamespace
        },
        syncPolicy: {
          automated: {
            prune: true,
            selfHeal: true
          }
        }
      }
    };

    return yaml.dump(application);
  }
}

module.exports = new ManifestGenerator();