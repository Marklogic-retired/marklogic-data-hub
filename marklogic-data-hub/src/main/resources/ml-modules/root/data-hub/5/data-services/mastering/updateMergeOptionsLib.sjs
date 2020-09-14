'use strict';

function updateMergeOptions(opt)
{
  let mergeRules = [];
  let mergeStrategies = [];
  let newOpt = {
    mergeStrategies: mergeStrategies,
    mergeRules: mergeRules
  };

  // a lookup object for properties (name -> object)
  let properties = {};
  if (opt.propertyDefs && opt.propertyDefs.properties) {
    opt.propertyDefs.properties.forEach((prop) => { properties[prop.name] = prop; });
  }

  // a lookup object for algorithms (name -> object)
  let algorithms = {};
  if (opt.algorithms && opt.algorithms.custom) {
    opt.algorithms.custom.forEach((alg) => { algorithms[alg.name] = alg; });
  }

  if (opt.mergeStrategies) {
    opt.mergeStrategies.forEach((item) =>
      {
        mergeStrategies.push(strategy(item, algorithms));
      }
    );
  }

  if (opt.merging) {
    opt.merging.forEach((item) =>
      {
        mergeRules.push(mergeRule(item, algorithms, properties, opt.propertyDefs.namespaces));
      }
    );
  }

  // targetCollections
  if (opt.algorithms && opt.algorithms.collections) {
    let colls = opt.algorithms.collections;
    let targetColls = {};
    if (colls.onMerge) {
      let obj = targetCollectionObject(colls.onMerge);
      if (obj) {
        targetColls.onMerge = obj;
      }
    }
    if (colls.onArchive) {
      let obj = targetCollectionObject(colls.onArchive);
      if (obj) {
        targetColls.onArchive = obj;
      }
    }
    if (colls.onNoMatch) {
      let obj = targetCollectionObject(colls.onNoMatch);
      if (obj) {
        targetColls.onNoMatch = obj;
      }
    }
    if (colls.onNotification) {
      let obj = targetCollectionObject(colls.onNotification);
      if (obj) {
        targetColls.onNotification = obj;
      }
    }
    if (targetColls.onMerge || targetColls.onArchive || targetColls.onNoMatch || targetColls.onNotification) {
      newOpt.targetCollections = targetColls;
    }
  }

  // lastUpdatedLocation
  if (opt.algorithms && opt.algorithms.stdAlgorithm && opt.algorithms.stdAlgorithm.timestamp) {
    if (opt.algorithms.stdAlgorithm.timestamp.path) {
      let last = {};
      if (opt.algorithms.stdAlgorithm.namespaces) {
        last.namespaces = opt.algorithms.stdAlgorithm.namespaces;
      }
      last.documentXPath = opt.algorithms.stdAlgorithm.timestamp.path;
      newOpt.lastUpdatedLocation = last;
    }
  }

  return newOpt
}

function strategy(item, algorithms) {
  let s = {
    "strategyName": item.name
  };

  if (item.maxSources) { s.maxSources = Number(item.maxSources); }
  if (item.maxValues) { s.maxValues = Number(item.maxValues); }
  if (item.length || item.sourceWeights) {
    let priorityOrder = {};
    if (item.length && item.length.weight) {
      priorityOrder.lengthWeight = Number(item.length.weight);
    }
    if (item.sourceWeights) {
      let sources = [];
      item.sourceWeights.forEach((sw) =>
        {
          if (sw.source) {
            let source = {};
            source.sourceName = sw.source.name;
            source.weight = Number(sw.source.weight);
            sources.push(source);
          }
        }
      );
      priorityOrder.sources = sources;
    }
    s.priorityOrder = priorityOrder;
  }

  if (item.algorithmRef) {
    let algorithm = algorithms[item.algorithmRef];
    if (algorithm) {
      s.mergeModulePath = algorithm.at;
      s.mergeModuleFunction = algorithm.function;
      s.mergeModuleNamespace = algorithm.namespace;
      s.options = {};
    }
  }

  return s
};

function mergeRule(item, algorithms, properties, namespaces) {
  let mr = {};

  xdmp.log("item:");
  xdmp.log(item);
  xdmp.log("algorithms:");
  xdmp.log(algorithms);
  xdmp.log("properties:");
  xdmp.log(properties);
  xdmp.log("namespaces:");
  xdmp.log(namespaces);

  if (item.propertyName) {
    let prop = properties[item.propertyName];
    if (prop) {
      if (prop.path) {
        mr.documentXPath = prop.path;
        if (namespaces) {
          mr.namespaces = namespaces;
        }
      }
      else if (prop.localname) {
        mr.entityPropertyPath = prop.localname;
      }
    }
  }
  if (item.strategy) { mr.mergeStrategyName = item.strategy; }
  if (item.maxSources) { mr.maxSources = Number(item.maxSources); }
  if (item.maxValues) { mr.maxValues = Number(item.maxValues); }
  if (item.length || item.sourceWeights) {
    let priorityOrder = {};
    if (item.length && item.length.weight) {
      priorityOrder.lengthWeight = item.length.weight;
    }
    if (item.sourceWeights) {
      let sources = [];
      item.sourceWeights.forEach((sw) =>
        {
          if (sw.source) {
            let source = {};
            source.sourceName = sw.source.name;
            source.weight = sw.source.weight;
            sources.push(source);
          }
        }
      );
      priorityOrder.sources = sources;
    }
    mr.priorityOrder = priorityOrder;
  }

  return mr
};

function targetCollectionObject(parent) {
  let obj = {};
  if (parent.add && parent.add.collection) { obj.add = parent.add.collection; }
  if (parent.remove && parent.remove.collection) { obj.remove = parent.remove.collection; }
  if (obj.add || obj.remove) {
    return obj;
  }
  else {
    return null;
  }
}


module.exports = {
  updateMergeOptions
};
