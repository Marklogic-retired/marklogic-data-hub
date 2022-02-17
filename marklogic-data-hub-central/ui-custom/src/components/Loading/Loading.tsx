import React from "react";
import Spinner from "react-bootstrap/Spinner";
import "./Loading.scss";

type Props = {
};

/**
 * Component for showing a loading indicator.
 *
 * @component
 * @example
 * TBD
 */
const Loading: React.FC<Props> = (props) => {

    return (
        <div className="loading">
            <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );

};

export default Loading;
