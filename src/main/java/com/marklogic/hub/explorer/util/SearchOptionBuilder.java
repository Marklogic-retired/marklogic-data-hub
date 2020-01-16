package com.marklogic.hub.explorer.util;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.marklogic.hub.explorer.model.SearchQuery;

import org.apache.commons.lang3.StringEscapeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import static com.marklogic.hub.explorer.model.SearchQuery.SortOrder;

@Component
public class SearchOptionBuilder {
  private static final Logger logger = LoggerFactory.getLogger(SearchOptionBuilder.class);

  private static final String SEARCH_HEAD = "<search xmlns=\"http://marklogic.com/appservices/search\">\n";
  private static final String SEARCH_TAIL = "</search>";

  private static final Set<String> METADATA_FIELD_NAME = new HashSet<>() {
    {
      add("datahubCreatedOn");
    }
  };

  public String buildSearchOptions(String query, SearchQuery searchQuery) throws IOException {
    StringBuilder sb = new StringBuilder();

    sb.append(SEARCH_HEAD);

    //build sort order options
    buildSortOrderOptions(sb, searchQuery);

    sb.append(query);
    sb.append(SEARCH_TAIL);

    logger.debug(String.format("Search options: \n %s", sb.toString()));
    return sb.toString();
  }

  private void buildSortOrderOptions(StringBuilder sb, SearchQuery searchQuery) {
    Optional<List<SortOrder>> sortOrders = searchQuery.getSortOrder();

    sortOrders.ifPresent(so -> {
      sb.append("<options>");
      so.forEach( o -> {
        sb.append("<sort-order");
        if (!METADATA_FIELD_NAME.contains(o.name)) {
          sb.append(String.format(" type=\"%s\"", "xs:" + StringEscapeUtils.escapeXml(o.dataType)));
        }
        if (!o.ascending) {
          sb.append(" direction=\"descending\">");
        } else {
          sb.append(" direction=\"ascending\">");
        }
        if (!METADATA_FIELD_NAME.contains(o.name)) {
          sb.append(String.format("<element ns=\"\" name=\"%s\"/>\n", StringEscapeUtils.escapeXml(o.name)));
        } else {
          sb.append(String.format("<field name=\"%s\"/>\n", StringEscapeUtils.escapeXml(o.name)));
        }
        sb.append("</sort-order>");
      });
      sb.append("</options>");
    });
  }
}
