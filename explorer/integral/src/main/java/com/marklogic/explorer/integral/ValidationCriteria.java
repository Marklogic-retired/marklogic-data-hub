package com.marklogic.explorer.integral;

import java.util.Optional;

/**
 * ValidationCriteria holds validation information and
 * provides simple access as to whether or not the
 * defined criteria are satisfied.  There are a few service
 * methods but the reality is that the satisfies()
 * method provides the same service.  This class exists
 * mostly because of the specification problem in the
 * JSON used to define the tests.
 */
public class ValidationCriteria<T extends Comparable> {
  public enum Operator { EQ, NOT_EQ, IN}

  final Operator operator;
  final Optional<T> left;
  final Optional<T> right;

  private ValidationCriteria() {
    operator = Operator.NOT_EQ;
    left = Optional.empty();
    right = Optional.empty();
  }


  public ValidationCriteria(Operator op, T left, T right) {
    this.left = Optional.ofNullable(left);
    this.right = Optional.ofNullable(right);
    operator = op;
  }

  /**
   * satisfies() determines if the criteria object is satisfied by its
   * properties and returns true if so and false if not.
   */
  public Boolean satisfies() {
    if (operator == null) throw new RuntimeException("operator must not be null!");
    switch (operator) {
      case EQ:
        if (left.isEmpty() && right.isEmpty()) return true;
        if (left.isEmpty()) return false;  // expected nothing but got something
        if (right.isEmpty()) return false;
        return (left.get().equals(right.get()));
      case NOT_EQ:
        if (left.isEmpty() && right.isEmpty()) return false;
        if (left.isEmpty()) return true; // expected nothing but got something
        if (right.isEmpty()) return true;
        return !(left.get().equals(right.get()));
      case IN:
        // this is "left is contained in right" -- and not necessarily the reverse
        // and only applies to strings or strings representing json
        String value = left.isEmpty()?"":left.get().toString();
        String result = right.isEmpty()?"":right.get().toString();
        return result.contains(value);
      default: // not reachable since the case is exhaustive
      return false;  // but java requires this
    }
  }

  @Override public String toString() {
    return operator.toString()+ " " + left.toString() + " " +right.toString();
  }
}