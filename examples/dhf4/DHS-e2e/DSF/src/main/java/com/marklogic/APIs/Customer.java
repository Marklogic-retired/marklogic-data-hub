package com.marklogic.APIs;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;
import java.io.Reader;


import com.marklogic.client.DatabaseClient;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface Customer {
    /**
     * Creates a Customer object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for session state
     */
    static Customer on(DatabaseClient db) {
        final class CustomerImpl implements Customer {
            private BaseProxy baseProxy;

            private CustomerImpl(DatabaseClient dbClient) {
                baseProxy = new BaseProxy(dbClient, "/APIs/Customer/");
            }

            @Override
            public Integer customerDocsCount(String collectionName) {
                System.out.println("\n Should return count of documents in the collection " + collectionName + " \n");
                return BaseProxy.IntegerType.toInteger(
                    baseProxy
                        .request("customerDocsCount.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC)
                        .withSession()
                        .withParams(
                            BaseProxy.atomicParam("collectionName", false, BaseProxy.StringType.fromString(collectionName)))
                        .withMethod("POST")
                        .responseSingle(false, null)
                );
            }


            @Override
            public Reader customerWithChInCompanyName(String keyword) {
                System.out.println("\n Should return all documents that have 'Ch' in CompanyName \n");
                return BaseProxy.JsonDocumentType.toReader(
                    baseProxy
                        .request("customerWithChInCompanyName.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC)
                        .withSession()
                        .withParams(
                            BaseProxy.atomicParam("keyword", false, BaseProxy.StringType.fromString(keyword)))
                        .withMethod("POST")
                        .responseSingle(false, Format.TEXT)
                );
            }


            @Override
            public Reader customerWithSalesAsTitle(String title) {
                System.out.println("\n Should return all documents(5) that have 'Sales' as ContactTitle \n");
                return BaseProxy.JsonDocumentType.toReader(
                    baseProxy
                        .request("customerWithSalesAsTitle.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC)
                        .withSession()
                        .withParams(
                            BaseProxy.atomicParam("title", false, BaseProxy.StringType.fromString(title)))
                        .withMethod("POST")
                        .responseSingle(false, Format.TEXT)
                );
            }

        }

        return new CustomerImpl(db);
    }

    /**
     * Invokes the customerDocsCount operation on the database server
     *
     * @param collectionName	provides input
     * @return	as output
     */
    Integer customerDocsCount(String collectionName);

    /**
     * Invokes the customerWithChInCompanyName operation on the database server
     *
     * @param keyword	provides input
     * @return	as output
     */
    Reader customerWithChInCompanyName(String keyword);

    /**
     * Invokes the customerWithSalesAsTitle operation on the database server
     *
     * @param title	provides input
     * @return	as output
     */
    Reader customerWithSalesAsTitle(String title);

}
