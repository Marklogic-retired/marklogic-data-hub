import React from "react";
import {Progress} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./expandable-table-view.module.scss";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {MLTable} from "@marklogic/design-system";

interface Props {
    rowData: any;
    allRuleset: any;
}

let counter = 0;

const testMatchedUriTableColumns = [
  {
    title: "Ruleset",
    dataIndex: "ruleName",
    key: "ruleName "+ (counter++),
    width: "16%",
    render: (ruleName, key) => (ruleName.map(property => {
      return <span className={styles.rulesetColumn} key={key} aria-label={ruleName}>{property}
      </span>;
    }))
  },
  {
    title: "Exact",
    dataIndex: "matchedRulesetType",
    key: "matchedRulesetType " + (counter++) + " exact",
    width: "6%",
    render: (matchedRulesetType, key, index) => (matchedRulesetType.map(rulesetType => {
      return (rulesetType === "Exact") && <span className={styles.testMatchedColumns} key={key} aria-label={matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType} />
      </span>;
    }))
  },
  {
    title: "Synonym",
    dataIndex: "matchedRulesetType",
    key: "matchedRulesetType " + (counter++) + " synonym",
    width: "8%",
    render: (matchedRulesetType, key, index) => (matchedRulesetType.map(rulesetType => {
      return (rulesetType === "Synonym") && <span className={styles.testMatchedColumns} key={key} aria-label={matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
      </span>;
    }))
  },
  {
    title: "Double Metaphone",
    dataIndex: "matchedRulesetType",
    width: "10%",
    key: "matchedRulesetType " + (counter++) + " metaphone",
    render: (matchedRulesetType, key, index) => (matchedRulesetType.map(rulesetType => {
      return (rulesetType === "Double Metaphone") && <span className={styles.testMatchedColumns} key={key} aria-label={matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
      </span>;
    }))
  },
  {
    title: "Zip",
    dataIndex: "matchedRulesetType",
    key: "matchedRulesetType " + (counter++) + " zip",
    width: "6%",
    render: (matchedRulesetType, key, index) => (matchedRulesetType.map(rulesetType => {
      return (rulesetType === "Zip") && <span className={styles.testMatchedColumns} key={key} aria-label={matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
      </span>;
    }))
  },
  {
    title: "Reduce",
    dataIndex: "matchedRulesetType",
    key: "matchedRulesetType " + (counter++) + " reduce",
    width: "7%",
    render: (matchedRulesetType, key, index) => (matchedRulesetType.map(rulesetType => {
      return (rulesetType === "Reduce") && <span className={styles.testMatchedColumns} key={key} aria-label={matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
      </span>;
    }))
  },
  {
    title: "Custom",
    dataIndex: "matchedRulesetType",
    key: "matchedRulesetType " + (counter++) + " custom",
    width: "8%",
    render: (matchedRulesetType, key, index) => (matchedRulesetType.map(rulesetType => {
      return (rulesetType === "Custom") && <span className={styles.testMatchedColumns} key={key} aria-label={matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
      </span>;
    }))
  },
  {
    title: "Match Score",
    dataIndex: "scores",
    key: "matchedRulesetType " + (counter++) + " score",
    width: "15%",
    render: (scores, key) =>  <span key={key}  aria-label={"score " + scores.scores[0]}>
      <Progress percent={scores.scores[0]} strokeWidth={20} strokeColor={scores.matchedRule[0] !== "Reduce" ? "#00b300" : "#ff0000"} format={scores.matchedRule[0] !== "Reduce" ? percent => `${percent}` : percent => `-${percent}`} strokeLinecap={"square"}/>
    </span>
  }
];

const ExpandableTableView: React.FC<Props> = (props) => {
  let allRuleset = props.allRuleset;
  let actionPreviewData = props.rowData.matchRulesets.map(matchRulseset => {
    let matchedRulesetProperty: string[] = [];
    let matchedRulesetType: string[] = [];
    let scores: string[] = [];
    let ruleName: string[] = [];
    let key= counter++;
    ruleName.push(matchRulseset);
    let ruleset = matchRulseset.split(" - ");
    matchedRulesetProperty.push(ruleset[0]);
    matchedRulesetType.push(ruleset[1]);
    for (let i=0;i<allRuleset.length;i++) {
      if (matchRulseset === allRuleset[i].name) {
        scores.push(allRuleset[i].weight);
      }
    }
    let data = {
      matchedRulesetProperty: matchedRulesetProperty,
      matchedRulesetType: matchedRulesetType,
      ruleName: ruleName,
      scores: {scores: scores, matchedRule: matchedRulesetType},
      key: key,
    };
    return data;
  });
  return <div className={styles.expandedTableView}><MLTable
    columns={testMatchedUriTableColumns}
    dataSource={actionPreviewData}
    pagination={false}
    rowKey="key"
    id="uriMatchedDataTable">
  </MLTable>
  <div className={styles.boldTextDisplay}> Total Score: {props.rowData.score}</div></div>;
};
export default ExpandableTableView;
