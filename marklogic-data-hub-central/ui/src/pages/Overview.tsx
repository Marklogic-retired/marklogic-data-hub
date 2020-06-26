import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Overview.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltRight, faCube, faCubes, faObjectUngroup, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";


const Overview = (props) => {

    return (
        <div className={styles.overviewContainer} aria-label="overview">
            <div className={styles.title}>Welcome to MarkLogic Data Hub Central</div>
            <div className={styles.introText}>Hub Central facilitates your team's workflow through the end-to-end agile data integration lifecycle. Load, Model, Curate, Run, and Explore – all in one place. 
            <div className={styles.spacer}></div>
            <span className={styles.note}>NOTE:</span> You might need additional permissions to access all the functionality. Contact your security administrator if you need to 
            access any disabled feature.
            </div>
            <div className={styles.cardsContainer}>
                <div className={styles.cards}>
                    <div className={styles.cardLoad}>
                        <div className={styles.head}></div>
                        <div className={styles.subtitle}>
                            <i aria-label="load-icon"><FontAwesomeIcon icon={faLongArrowAltRight} /></i>Load
                        </div>
                        <div className={styles.body}>Ingest raw data from multiple file types.</div>
                    </div>
                    
                    <div className={styles.cardModel}>
                        <div className={styles.head}></div>
                        <span className={styles.icon}></span> 
                        <div className={styles.subtitle}>
                            <i aria-label="model-icon"><FontAwesomeIcon icon={faCube} /></i>Model
                        </div>
                        <div className={styles.body}>Define entity types that will be leveraged during curation.</div>
                    </div>
                    
                    <div className={styles.cardCurate}>
                        <div className={styles.head}></div>
                        <span className={styles.icon}></span> 
                        <div className={styles.subtitle}>
                            <i aria-label="curate-icon"><FontAwesomeIcon icon={faObjectUngroup} /></i>Curate
                        </div>
                        <div className={styles.body}>Create a 360º view.</div>
                    </div>
                    
                    <div className={styles.cardExplore}>
                        <div className={styles.head}>
                            <span className={styles.icon} aria-label="explore-icon"></span> 
                            <div className={styles.subtitle}>Explore</div>
                            <div className={styles.body}>Search through curated data.</div>
                        </div>
                    </div>
                    
                    <div className={styles.cardRun}>
                        <div className={styles.head}>
                            <span className={styles.icon}></span> 
                            <div className={styles.subtitle}>
                                <i aria-label="run-icon"><FontAwesomeIcon icon={faCubes} /></i>Run
                            </div>
                            <div className={styles.body}>Arrange steps into data flows to test loading and curation.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overview;
