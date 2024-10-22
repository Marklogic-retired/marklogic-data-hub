/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

import common from "/data-hub/data-services/mastering/validateStepCommonLib.mjs";

const mergingOptions = require("/com.marklogic.smart-mastering/survivorship/merging/options.xqy");

function propertiesWarning(mergeStep, entityPropertyPath) {
    let compiledOptions = mergingOptions.compileMergeOptions(mergeStep, true);
    let mergeRulesInfo = compiledOptions.mergeRulesInfo ? Sequence.from([compiledOptions.mergeRulesInfo]).toArray() : [];
    let nonCompliantRules = mergeRulesInfo.filter((ruleInfo) => {
        let allowsMultipleValues = ruleInfo.allowsMultipleValues;
        let ruleObject = ruleInfo.mergeRule ? ruleInfo.mergeRule.toObject() : null;
        let valuesLimitedToOne = ruleObject && (fn.string(ruleObject.maxValues) === "1" || fn.string(ruleObject.maxSources) === "1");
        let ruleFilteredOut = false;
        if (entityPropertyPath) {
            let ruleEntityPropertyPath = ruleObject ? ruleObject.entityPropertyPath : "";
            ruleFilteredOut = ruleEntityPropertyPath !== entityPropertyPath;
        }
        return !(ruleFilteredOut || allowsMultipleValues || valuesLimitedToOne);
    });
    let nonCompliantRuleProperties = nonCompliantRules.map((ruleInfo) => {
        return ruleInfo.propertyName;
    });
    if (nonCompliantRuleProperties.length) {
        let entityTypeTitle = common.parseEntityTypeTitle(mergeStep.targetEntityType);
        let warningPropertiesStr = nonCompliantRuleProperties.join(", ");
        return common.warningObject("warn", `Warning: The current merge settings might produce merged documents that are inconsistent with the entity type
In the entity type ${entityTypeTitle}, the property or properties ${warningPropertiesStr} allows only a single value.
In every merge rule for the property ${warningPropertiesStr} set Max Values or Max Sources to 1.`);
    }
}

export default {
    propertiesWarning
};
