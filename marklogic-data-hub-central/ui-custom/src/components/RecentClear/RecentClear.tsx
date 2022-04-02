import React, {useContext, useState} from "react";
import "./RecentClear.scss";
import ConfirmationModal from "../confirmation-modal/confirmation-modal";
import { DetailContext } from "../../store/DetailContext";

type Props = {
    title?: string;
};

/**
 * Component for showing a recent clear button around one or more other components.
 *
 * @component
 * @prop {string} title RecentClear label.
 * @example
 * <RecentClear title="My RecentClear Title">
 *   <SomeComponent />
 * </RecentClear>
 */

const RecentClear: React.FC<Props> = (props) => {
    const detailContext = useContext(DetailContext);
    const [showModal, setShowModal] = useState(false);
    const confirmationModalBody = "Clear recently visited record history for the current user?"

    const showModalHandler = () => {
      setShowModal(true);
    }

    const HandleDeleteRecords = async () => {
      await detailContext.handleDeleteAllRecent();
      setShowModal(false);
    }

    return (
        <span className="recent-clear">
         <button className="clear-button" data-testid="clearButton" onClick={showModalHandler} disabled={!detailContext.hasSavedRecords()}>{props.title}</button>
            <ConfirmationModal
                isVisible={showModal}
                toggleModal={setShowModal}
                confirmAction={HandleDeleteRecords}
                bodyContent={confirmationModalBody}
                headerContent = {""}
                data-testid="resetConfirmationModal"
            />
        </span>
);
};

export default RecentClear;