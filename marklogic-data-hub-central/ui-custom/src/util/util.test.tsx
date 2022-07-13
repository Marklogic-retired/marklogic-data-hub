import {getValByPath, getValByConfig} from "./util";

const data = {
    root: {
        contact: "emailVal1",
        contactObj: {email: "emailVal1", phone: "phoneVal1"},
        contactArraySingle: ["emailVal1", "emailVal2"],
        contactArrayObj: [{email: "emailVal1"}, {email: "emailVal2"}],
        contactNestedArrays: [
            {
                emailArray: ["emailVal1-1", "emailVal1-1"],
                phone: "phoneVal1"
            }, 
            {
                emailArray: ["emailVal2-1", "emailVal2-1"],
                phone: "phoneVal2"
            },
        ],
        contactAttr: [
            {
                contact: "emailVal1",
                attr: "email"
            },
            {
                contact: "phoneVal1",
                attr: "phone"
            }
        ],
        contactSingleEmpty: "",
        contactObjEmpty: {},
        contactArrayEmpty: [],
    }
}
const dataSingleCase = {
    root: {
        // XML-to-JSON conversion returns singletons as objects
        contacts: {contact: {email: "emailVal1"}},
    }
}
const dataArrayCase = {
    root: {
        // XML-to-JSON conversion returns multiples as arrays
        contacts: {contact: [{email: "emailVal1"}, {email: "emailVal2"}]},
    }
}

const exprSingle = "root.contact";
const exprObj = "root.contactObj";
const exprArraySingle = "root.contactArraySingle";
const exprArrayObj = "root.contactArrayObj";
// Handle case where result value could be array or singleton
const exprSingleOrArray = "root.contacts..*[?(@property === 'email')]";
const exprNestedArrays = "root..emailArray";
const exprPropAttr = "root.contactAttr..[?(@[`attr`] === 'email')]";
const exprSingleEmpty = "root.contactSingleEmpty";
const exprObjEmpty = "root.contactObjEmpty";
const exprArrayEmpty = "root.contactArrayEmpty";
const exprNotFound = "root.doesNotExist";

describe("getValByPath method", () => {
    test("Handle single value", () => {
        const result = getValByPath(data, exprSingle);
        expect(result).toEqual(data.root.contact);
    });
    test("Handle object value", () => {
        const result = getValByPath(data, exprObj);
        expect(result).toEqual(data.root.contactObj);
    });
    test("Handle array of single values", () => {
        const result = getValByPath(data, exprArraySingle);
        expect(result).toEqual(data.root.contactArraySingle);
    });
    test("Handle array of object values", () => {
        const result = getValByPath(data, exprArrayObj);
        expect(result).toEqual(data.root.contactArrayObj);
    });
    test("Handle single object value (array or single case)", () => {
        const result = getValByPath(dataSingleCase, exprSingleOrArray);
        expect(result).toEqual([dataSingleCase.root.contacts.contact.email]);
    });
    test("Handle array of object values (array or single case)", () => {
        const result = getValByPath(dataArrayCase, exprSingleOrArray);
        expect(result).toEqual([
            dataArrayCase.root.contacts.contact[0].email, 
            dataArrayCase.root.contacts.contact[1].email
        ]);
    });
    test("Handle inner array within nested arrays", () => {
        const result = getValByPath(data, exprNestedArrays);
        expect(result).toEqual([
            data.root.contactNestedArrays[0].emailArray, 
            data.root.contactNestedArrays[1].emailArray
        ]);
    });
    test("Handle object filtered by attribute property", () => {
        const result = getValByPath(data, exprPropAttr);
        expect(result).toEqual([data.root.contactAttr[0]]);
    });
    test("Handle array when getFirst is true", () => {
        const result = getValByPath(data, exprArraySingle, true);
        expect(result).toEqual(data.root.contactArraySingle[0]);
    });
    test("Handle empty single value", () => {
        const result = getValByPath(data, exprSingleEmpty);
        expect(result).toEqual("");
    });
    test("Handle empty object value", () => {
        const result = getValByPath(data, exprObjEmpty);
        expect(result).toEqual({});
    });
    test("Handle empty array value", () => {
        const result = getValByPath(data, exprArrayEmpty);
        expect(result).toEqual([]);
    });
    test("Handle expression yielding no values", () => {
        const result = getValByPath(data, exprNotFound);
        expect(result).toEqual(undefined);
    });
})

const configPath = { path: "root.contact" };
const configArrayPath = { arrayPath: "root.contactNestedArrays" };
const configArrayPathAndPath = { arrayPath: "root.contactAttr", path: "contact" };
const configDoesNotExist = { path: "root.doesNotExist" };

describe("getValByConfig method", () => {
    test("Handle config with path ONLY", () => {
        const result = getValByConfig(data, configPath);
        expect(result).toEqual(data.root.contact);
    });
    test("Handle config with arrayPath ONLY", () => {
        const result = getValByConfig(data, configArrayPath);
        expect(result).toEqual(data.root.contactNestedArrays);
    });
    test("Handle config with arrayPath and path", () => {
        const result = getValByConfig(data, configArrayPathAndPath);
        expect(result).toEqual(["emailVal1", "phoneVal1"]);
    });
    test("Handle config when getFirst is true", () => {
        const result = getValByConfig(data, configArrayPathAndPath, true);
        expect(result).toEqual(data.root.contactAttr[0].contact);
    });
    test("Handle config yielding no values", () => {
        const result = getValByConfig(data, configDoesNotExist);
        expect(result).toEqual(null);
    });
})