package com.marklogic.hub.explorer.util;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ForbiddenUserException;
import com.marklogic.client.MarkLogicServerException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.expression.PlanBuilder;
import com.marklogic.client.expression.PlanBuilder.ModifyPlan;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.row.RowManager;
import com.marklogic.hub.explorer.exception.ExplorerException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class SqlExecutioner {

  private static final Logger logger = LoggerFactory.getLogger(SqlExecutioner.class);

  public JacksonHandle executeSqlQuery(DatabaseClient client, String query) {
    try {
      RowManager rowMgr = client.newRowManager();
      PlanBuilder planBuilder = rowMgr.newPlanBuilder();
      ModifyPlan plan = planBuilder.fromSql(query);
      JacksonHandle handle = new JacksonHandle();
      return rowMgr.resultDoc(plan, handle);
    } catch (MarkLogicServerException e) {
      if (e instanceof ResourceNotFoundException || e instanceof ForbiddenUserException) {
        logger.warn(e.getLocalizedMessage());
      } else { //FailedRequestException || ResourceNotResendableException
        logger.error(e.getLocalizedMessage());
      }
      throw new ExplorerException(e.getServerStatusCode(), e.getServerMessageCode(),
          e.getServerMessage(), e);
    } catch (Exception e) { //other runtime exceptions
      throw new ExplorerException(e.getLocalizedMessage(), e);
    }
  }
}
