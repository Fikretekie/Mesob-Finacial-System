import React, { useState } from "react";
import { UncontrolledTooltip } from "reactstrap";
import {
  getBalanceColor,
  getBalanceState,
  FINANCIAL_COLORS,
} from "utils/financialColors";

/**
 * Renders a monetary balance with positive / zero / negative coloring.
 * Negative values show a warning icon and optional tooltip.
 */
const BalanceValue = ({
  value,
  children,
  className,
  style,
  showWarning = true,
  tooltip,
  tag: Tag = "span",
}) => {
  const [tooltipId] = useState(
    () => `balance-${Math.random().toString(36).slice(2, 11)}`
  );
  const color = getBalanceColor(value);
  const isNegative = getBalanceState(value) === "negative";

  return (
    <>
      <Tag
        id={isNegative && tooltip ? tooltipId : undefined}
        className={className}
        style={{
          color,
          fontWeight: style?.fontWeight ?? "bold",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          ...style,
        }}
      >
        {isNegative && showWarning && (
          <span aria-hidden style={{ color: FINANCIAL_COLORS.negative }}>
            ⚠️
          </span>
        )}
        {children}
      </Tag>
      {isNegative && tooltip && (
        <UncontrolledTooltip target={tooltipId} placement="top">
          {tooltip}
        </UncontrolledTooltip>
      )}
    </>
  );
};

export default BalanceValue;
