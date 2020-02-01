import axios from 'axios';

const defaultEnv = {
    projectName: '',
    projectDir: '',
    dataHubVersion: '',   
    markLogicVersion: '',
    host:'',
    stagingPort:''
  }

export function setEnvironment()  {
    axios.get('/api/environment/project-info')
            .then(res => {          
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