import React from "react";
import DetailHeader from "./detail-header";
import jsonDocPayload from "../../assets/mock-data/explore/json-document-payload";
import {render} from "@testing-library/react";

describe("Detail component", () => {
  let infoRender: any;

  describe("Using JSON document payload with primaryKey", () => {
    beforeEach(() => {
      infoRender = render(
        <DetailHeader
          document={jsonDocPayload.data}
          uri="/Users/ban/Documents/Projects/dhf-files/store-data/products/games/ebb9671e-4c3d-4b33-810f-d57d7c5d5897.json"
          primaryKey="1000201"
          contentType="json"
          sources={jsonDocPayload.data.envelope.headers.sources}
        />,
      );
    });

    test("component renders", () => {
      expect(infoRender.container.querySelectorAll("#header")).toHaveLength(1);
      expect(infoRender.container.querySelectorAll("#title")).toHaveLength(1);
      expect(infoRender.container.querySelectorAll("#summary")).toHaveLength(1);
    });

    test("data renders", () => {
      expect(infoRender.container.querySelectorAll(`[data-cy="document-title"]`)).toHaveLength(1);
      expect(infoRender.container.querySelectorAll(`[data-cy="document-timestamp"]`)).toHaveLength(1);
      expect(infoRender.container.querySelectorAll(`[data-cy="document-source"]`)).toHaveLength(1);
      expect(infoRender.container.querySelectorAll(`[data-cy="document-recordtype"]`)).toHaveLength(1);
    });
    test("primaryKey renders", () => {
      expect(infoRender.container.querySelectorAll(`[data-cy="document-id"]`)).toHaveLength(1);
    });
  });

  describe("Using JSON document payload without primaryKey", () => {
    beforeEach(() => {
      infoRender = render(
        <DetailHeader
          document={jsonDocPayload.data}
          uri="/Users/ban/Documents/Projects/dhf-files/store-data/products/games/ebb9671e-4c3d-4b33-810f-d57d7c5d5897.json"
          primaryKey=""
          contentType="json"
          sources={jsonDocPayload.data.envelope.headers.sources}
        />,
      );
    });

    test("component renders", () => {
      expect(infoRender.container.querySelectorAll("#header")).toHaveLength(1);
      expect(infoRender.container.querySelectorAll("#title")).toHaveLength(1);
      expect(infoRender.container.querySelectorAll("#summary")).toHaveLength(1);
    });

    test("data renders", () => {
      expect(infoRender.container.querySelectorAll(`[data-cy="document-title"]`)).toHaveLength(1);
      expect(infoRender.container.querySelectorAll(`[data-cy="document-timestamp"]`)).toHaveLength(1);
      expect(infoRender.container.querySelectorAll(`[data-cy="document-source"]`)).toHaveLength(1);
      expect(infoRender.container.querySelectorAll(`[data-cy="document-recordtype"]`)).toHaveLength(1);
    });
    test("uri renders", () => {
      expect(infoRender.container.querySelectorAll(`[data-cy="document-uri"]`)).toHaveLength(1);
    });
  });
  // TODO add test case for XML data
});
