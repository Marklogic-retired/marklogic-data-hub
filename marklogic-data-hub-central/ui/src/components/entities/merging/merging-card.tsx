import React, { useState, useContext } from 'react';
import styles from './merging-card.module.scss';
import AddMergeRuleDialog from './add-merge-rule/add-merge-rule-dialog';
import { CurationContext } from '../../../util/curation-context';
import { MLButton } from '@marklogic/design-system';

interface Props {
    entityName: any;
    entityModel: any;
    canReadMatchMerge: boolean;
    canWriteMatchMerge: boolean;
}

const MergingCard: React.FC<Props> = (props) => {
    const [openAddMergeRuleDialog, setOpenAddMergeRuleDialog] = useState(false); //Should be set to "true" to test the Add merge Rule dialog UI temporarily.
    const { setActiveStep } = useContext(CurationContext);

    /*---------------------------------------*/
    // Temporary code - To be removed when working on CRUD Merge step story
    const [showMergeRuleDialog, toggleMergeRuleDialog] = useState(true);

    const displayAddMergeRuleDialog = () => {
        setActiveStep([], props.entityModel['model']['definitions'], props.entityName);
        toggleMergeRuleDialog(true);
        setOpenAddMergeRuleDialog(true);
    };
    /*---------------------------------------*/
    return (
        <div className={styles.mergingContainer}>
            {/* Below button and the ternary operation based on showMergeRuleDialog should be removed/modified when working on CRUD merge step */}
            <MLButton type="primary" onClick={displayAddMergeRuleDialog}>Add (Temp button to test Rule dialog)</MLButton>
            { showMergeRuleDialog ?
                <AddMergeRuleDialog data={[]} openAddMergeRuleDialog={openAddMergeRuleDialog} setOpenAddMergeRuleDialog={setOpenAddMergeRuleDialog}/>
               : ''}
        </div>
    );

};

export default MergingCard;
