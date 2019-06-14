export class FlowConfig {

  flow1 = {
    flowName: 'TestFlow1',
    flowDesc: 'Description Flow 1'
  };

  flow2 = {
    flowName: 'TestFlow2',
    flowDesc: 'Description Flow 2'
  };

  flow3 = {
    flowName: 'TestFlow3',
    flowDesc: 'Description Flow 3'
  };

  flow4 = {
    flowName: 'TestFlow4',
    flowDesc: 'Description Flow 4'
  };

  flow5 = {
    flowName: 'TestFlow5',
    flowDesc: 'Description Flow 5'
  };

  flow6 = {
    flowName: 'TestFlow6',
    flowDesc: 'Description Flow 6'
  };

  flow7 = {
    flowName: 'TestFlow7',
    flowDesc: 'Description Flow 7'
  };

  flow8 = {
    flowName: 'TestFlow8',
    flowDesc: 'Description Flow 8'
  };


  flowWithOptions = {
    flowName: 'TestFlow1',
    flowDesc: 'Test flow1 description',
    batchSize: 100,
    threadCount: 4,
    options: {
      0: ['key1', 'value1'],
      1: ['key2', 'value2']
    }
  };
}

let flowConfig = new FlowConfig();
export default flowConfig;
