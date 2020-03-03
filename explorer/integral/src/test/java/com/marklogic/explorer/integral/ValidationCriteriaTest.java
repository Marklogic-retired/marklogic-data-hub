package com.marklogic.explorer.integral;

import static com.marklogic.explorer.integral.ValidationCriteria.Operator.EQ;
import static com.marklogic.explorer.integral.ValidationCriteria.Operator.IN;
import static com.marklogic.explorer.integral.ValidationCriteria.Operator.NOT_EQ;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ValidationCriteriaTest")
class ValidationCriteriaTest {

  @Test
  void testEquality() {
    var equality = new ValidationCriteria<>(EQ, 1776, 1776);
    assertTrue(equality.satisfies());
  }

  @Test
  void testInequality() {
    var inequality = new ValidationCriteria<>(NOT_EQ, 1775, 1776);
    assertTrue(inequality.satisfies());
  }

  @Test
  void testStringEquality() {
    //@SuppressWarnings()
    var equality = new ValidationCriteria<>(EQ, new String("1776"), new String("1776"));
    assertTrue(equality.satisfies());
  }

  @Test
  void testStringInequality() {
    var inequality = new ValidationCriteria<>(NOT_EQ, 1775, 1776);
    assertTrue(inequality.satisfies());
  }

  @Test
  void testSubstringMembership() {
    var membership = new ValidationCriteria<>(IN, "lazy dog", "the quick brown fox jumped over the lazy dog");
    assertTrue(membership.satisfies());
  }

  @Test
  void testNotSubstring() {
    var substring = new ValidationCriteria<>(IN, "Blaise Pascal", "Goedel, Escher, Bach");
    assertFalse(substring.satisfies());
  }
}
