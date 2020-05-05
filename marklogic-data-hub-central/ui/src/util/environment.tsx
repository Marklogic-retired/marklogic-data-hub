import axios from 'axios';

const defaultEnv = {
    projectName: '',
    dataHubVersion: '',
    markLogicVersion: ''
}

export function setEnvironment()  {
    axios.get('/api/environment/project-info')
            .then(res => {
                //'projectName' redundantly set to handle scenario after installation
                localStorage.setItem('projectName', res.data.projectName);
                localStorage.setItem('environment', JSON.stringify(res.data)) ;
            })
            .catch(err => {
                console.log(err);
            })
}

export function getEnvironment():any {
    let env: any;
    env = localStorage.getItem('environment');
    console.log(env);
    if(env) {
        return JSON.parse(env);
    }
    else{
        return defaultEnv;
    }
}

export function resetEnvironment() {
    localStorage.setItem('environment', JSON.stringify(defaultEnv));
}

export default { setEnvironment, getEnvironment, resetEnvironment };
