import {render} from "@testing-library/react";
import Image from "./Image";
const config = {
  alt: "Image Test"
}
describe("Image Component", () => {
  it("Verify Image is rendered", () => {
    const {getByTestId, getByAltText} = render(<Image config={config} style={{width: 100}} />)
    expect(getByTestId("imageId")).toBeInTheDocument();
    expect(getByTestId("imageId")).toHaveStyle(`width: 100px`);
    expect(getByAltText("Image Test")).toBeInTheDocument();
  });
});