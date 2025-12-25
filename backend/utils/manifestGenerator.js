
// /home/claude/devops-dashboard/backend/utils/manifestGenerator.js

const yaml = require('js-yaml');



const generateDockerCompose = (config) => {

  const { services = [] } = config;

  

  const compose = {

    version: '3.8',

    services: {}

  };



  services.forEach(service => {

    compose.services[service.name] = {

      image: service.image,

      container_name: service.containerName || service.name,

      ports: service.ports || [],

      environment: service.environment || {},

      volumes: service.volumes || [],

      networks: service.networks || ['default']

    };

  });



  compose.networks = { default: { driver: 'bridge' } };



  return yaml.dump(compose);

};



const generateKubernetesDeployment = (config) => {

  const { name, image, replicas = 1, port, env = {} } = config;



  const deployment = {

    apiVersion: 'apps/v1',

    kind: 'Deployment',

    metadata: { name },

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

            ports: port ? [{ containerPort: port }] : [],

            env: Object.entries(env).map(([key, value]) => ({ name: key, value }))

          }]

        }

      }

    }

  };



  return yaml.dump(deployment);

};



const generateAnsiblePlaybook = (config) => {

  const { name, hosts = 'all', tasks = [] } = config;



  const playbook = [{

    name,

    hosts,

    become: true,

    tasks: tasks.map(task => ({

      name: task.name,

      [task.module]: task.params

    }))

  }];



  return yaml.dump(playbook);

};



const generateTerraformConfig = (config) => {

  const { provider = 'aws', resources = [] } = config;



  let terraform = `provider "${provider}" {\n  region = "us-east-1"\n}\n\n`;



  resources.forEach(resource => {

    terraform += `resource "${resource.type}" "${resource.name}" {\n`;

    Object.entries(resource.config).forEach(([key, value]) => {

      terraform += `  ${key} = "${value}"\n`;

    });

    terraform += `}\n\n`;

  });



  return terraform;

};



module.exports = {

  generateDockerCompose,

  generateKubernetesDeployment,

  generateAnsiblePlaybook,

  generateTerraformConfig

};

