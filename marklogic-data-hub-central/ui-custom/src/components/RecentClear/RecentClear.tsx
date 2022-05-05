import React, {useContext, useState} from "react";
import "./RecentClear.scss";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { DetailContext } from "../../store/DetailContext";
import { SearchContext } from "../../store/SearchContext";

type Props = {
    title?: string;
    type?: string;
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
    const searchContext = useContext(SearchContext);
    const [showModal, setShowModal] = useState(false);
    const confirmationModalBody = `Clear ${props.title} history for the current user?`
    const title = props?.title === undefined ? "" : props.title;

    const showModalHandler = () => {
      setShowModal(true);
    }

    const HandleDeleteRecords = async () => {
      if(props.type === "recentRecords") {
          await detailContext.handleDeleteAllRecent();
          setShowModal(false);
      }
      else {
          await searchContext.handleDeleteAllRecent();
          setShowModal(false);
      }
    }

    return (
        <span data-testid="recentClearContainer" className={props.type === "recentRecords" ? "recent-clear-records" : "recent-clear-searches"}>
         <button className="clear-button" data-testid={props.type + "-clearButton"} onClick={showModalHandler} disabled={props.type === "recentRecords" ? !detailContext.hasSavedRecords() : !searchContext.hasSavedRecords()}>Clear</button>
            <ConfirmationModal
                isVisible={showModal}
                toggleModal={setShowModal}
                confirmAction={HandleDeleteRecords}
                bodyContent={confirmationModalBody}
                headerContent = {""}
                title = {title}
            />
        </span>
);
};

export default RecentClear;