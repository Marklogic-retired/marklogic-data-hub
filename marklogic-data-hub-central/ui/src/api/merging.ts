import axios from "axios";

export const updateMergingArtifact = async (merging) => {
    try {
        let response = await axios.post(`/api/steps/merging/${merging.name}`, merging);
        if (response.status === 200) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        let message = error;
        console.error('Error while saving the merge rule!', message);
        return false;
    }
};
