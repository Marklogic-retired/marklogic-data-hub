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
        <div data-testid="loadingId" className="d-flex w-100 justify-content-center loading">
            <Spinner data-testid="spinnerId" animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );

};

export default Loading;
