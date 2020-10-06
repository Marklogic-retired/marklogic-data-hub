import React from 'react';
import styles from './Overview.module.scss';
import { useHistory } from 'react-router-dom';

interface Props {
    enabled: any;
}

const Overview: React.FC<Props> = (props) => {

    const history: any = useHistory();

    const goToTile = (id) => {
        if (props.enabled && props.enabled.includes(id)) {
            history.push({
                pathname: `/tiles/${id}`,
                state: {
                    tileIconClicked : true
                }
            });
        }
    };

    const getClassNames = (id) => {
        const nameMap = {
            'load': 'cardLoad',
            'model': 'cardModel',
            'curate': 'cardCurate',
            'explore': 'cardExplore',
            'run': 'cardRun'
        };
        if (props.enabled && props.enabled.includes(id)) {
            return `${styles[nameMap[id]]} ${styles.enabled}`;
        } else {
            return `${styles[nameMap[id]]} ${styles.disabled}`;
        }
    };

    return (
        <div className={styles.overviewContainer} aria-label="overview">
            <div className={styles.title}>Welcome to MarkLogic Data Hub Central</div>
            <div className={styles.introText} aria-label={'introText'}>MarkLogic Data Hub Central brings together the Data Hub features in a single intuitive interface on DHS. Load your data, curate and manage your data, or explore and export your data — all within Hub Central.
            <div className={styles.spacer}></div>
            <span className={styles.note}>NOTE:</span> You might need additional permissions for advanced features. Contact your security administrator to access disabled features.
            </div>
            <div className={styles.cardsContainer}>
                <div className={styles.cards}>
                    <div className={getClassNames('load')} onClick={() => {goToTile('load');}} aria-label={'load-card'}>
                        <div className={styles.head}></div>
                        <div className={styles.subtitle}>
                            <span className={styles.icon} aria-label="load-icon"></span>Load
                        </div>
                        <div className={styles.body}>Create and configure steps that define how data should be loaded.
                            { props.enabled && !props.enabled.includes('load') &&
                            <div className={styles.permissions}>*additional permissions required</div> }
                        </div>
                    </div>

                    <div className={getClassNames('model')} onClick={() => {goToTile('model');}} aria-label={'model-card'}>
                        <div className={styles.head}></div>
                        <div className={styles.subtitle}>
                            <span className={styles.icon} aria-label="model-icon"></span>Model
                        </div>
                        <div className={styles.body}>Define the entity models that describe and standardize your data.
                            { props.enabled && !props.enabled.includes('model') &&
                            <div className={styles.permissions}>*additional permissions required</div> }
                        </div>
                    </div>

                    <div className={getClassNames('curate')} onClick={() => {goToTile('curate');}} aria-label={'curate-card'}>
                        <div className={styles.head}></div>
                        <div className={styles.subtitle}>
                            <span className={styles.icon} aria-label="curate-icon"></span>Curate
                        </div>
                        <div className={styles.body}>Create and configure steps that curate and refine your data.
                            { props.enabled && !props.enabled.includes('curate') &&
                            <div className={styles.permissions}>*additional permissions required</div> }
                        </div>
                    </div>

                    <div className={getClassNames('explore')} onClick={() => {goToTile('explore');}} aria-label={'explore-card'}>
                        <div className={styles.head}>
                            <span className={styles.icon} aria-label="explore-icon"></span>
                            <div className={styles.subtitle}>Explore</div>
                            <div className={styles.body}>Search, filter, and export your curated data.
                                { props.enabled && !props.enabled.includes('explore') &&
                                <div className={styles.permissionsExplore}>*additional permissions required</div> }
                            </div>
                        </div>
                    </div>

                    <div className={getClassNames('run')} onClick={() => {goToTile('run');}} aria-label={'run-card'}>
                        <div className={styles.head}>
                            <div className={styles.subtitle}>
                                <span className={styles.icon} aria-label="run-icon"></span>Run
                            </div>
                            <div className={styles.body}>Add your step to a flow and run it.
                                { props.enabled && !props.enabled.includes('run') &&
                                <div className={styles.permissionsRun}>*additional permissions required</div> }
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Overview;
