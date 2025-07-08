import React, { DOMAttributes } from 'react';
import { Property } from 'csstype';
import Vector2 from '../geometry/Vector2';
import { AnchorPositionType, ValidLineStyles, LineGroupType } from '../types';
import { computeArrowDirectionVector } from './SvgArrow.helper';

type Props = {
  className?: string;
  startingPoint: Vector2;
  startingAnchorOrientation: AnchorPositionType;
  endingPoint: Vector2;
  endingAnchorOrientation: AnchorPositionType;
  strokeColor: string;
  strokeWidth: number;
  strokeDasharray?: string;
  arrowLabel?: React.ReactNode | null | undefined;
  arrowMarkerId: string;
  lineStyle: ValidLineStyles;
  offset?: number;
  enableStartMarker?: boolean;
  disableEndMarker?: boolean;
  endShape: Record<string, any>;
  domAttributes?: DOMAttributes<SVGElement>;
  hitSlop?: number;
  cursor?: Property.Cursor;
  lineGroupType?: LineGroupType;
  roundCorner?: number;
};

export function computeArrowPointAccordingToArrowHead(
  xArrowHeadPoint: number,
  yArrowHeadPoint: number,
  arrowLength: number,
  strokeWidth: number,
  endingAnchorOrientation: AnchorPositionType,
  lineStyle?: ValidLineStyles,
  xArrowStart?: number,
  yArrowStart?: number,
) {
  let { arrowX, arrowY } = computeArrowDirectionVector(endingAnchorOrientation);

  if (lineStyle === 'straight' && xArrowStart !== undefined && yArrowStart !== undefined) {
    const angle = Math.atan2(yArrowStart - yArrowHeadPoint, xArrowStart - xArrowHeadPoint);
    arrowX = Math.cos(angle);
    arrowY = Math.sin(angle);
  }

  const xPoint = xArrowHeadPoint + (arrowX * arrowLength * strokeWidth) / 2;
  const yPoint = yArrowHeadPoint + (arrowY * arrowLength * strokeWidth) / 2;
  return {
    xPoint,
    yPoint,
  };
}

//Calculate the two points where the starting point is converted into a curve
export function computeStartingCurvePosition(
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  roundCorner: number,
  startingAnchorOrientation: AnchorPositionType,
): {
  xAnchor1_1: number;
  yAnchor1_1: number;
  xAnchor1_2: number;
  yAnchor1_2: number;
} {
  let curvature = roundCorner;
  if (startingAnchorOrientation === 'top' || startingAnchorOrientation === 'bottom') {
    return {
      xAnchor1_1: xStart,
      yAnchor1_1: yStart + (yEnd - yStart) / 2 - Math.sign(yEnd - yStart) * curvature,
      xAnchor1_2: xStart + Math.sign(xEnd - xStart) * curvature,
      yAnchor1_2: yStart + (yEnd - yStart) / 2,
    };
  }

  if (startingAnchorOrientation === 'left' || startingAnchorOrientation === 'right') {
    return {
      xAnchor1_1: xStart + (xEnd - xStart) / 2 - Math.sign(xEnd - xStart) * curvature,
      yAnchor1_1: yStart,
      xAnchor1_2: xStart + (xEnd - xStart) / 2,
      yAnchor1_2: yStart + Math.sign(yEnd - yStart) * curvature,
    };
  }

  return {
    xAnchor1_1: xStart,
    yAnchor1_1: yStart,
    xAnchor1_2: xStart,
    yAnchor1_2: yStart,
  };
}

export function computeStartingAnchorPosition(
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  startingAnchorOrientation: AnchorPositionType,
): {
  xAnchor1: number;
  yAnchor1: number;
} {
  if (startingAnchorOrientation === 'top' || startingAnchorOrientation === 'bottom') {
    return {
      xAnchor1: xStart,
      yAnchor1: yStart + (yEnd - yStart) / 2,
    };
  }

  if (startingAnchorOrientation === 'left' || startingAnchorOrientation === 'right') {
    return {
      xAnchor1: xStart + (xEnd - xStart) / 2,
      yAnchor1: yStart,
    };
  }

  return {
    xAnchor1: xStart,
    yAnchor1: yStart,
  };
}

export function computeEndingAnchorPosition(
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  endingAnchorOrientation: AnchorPositionType,
): {
  xAnchor2: number;
  yAnchor2: number;
} {
  if (endingAnchorOrientation === 'top' || endingAnchorOrientation === 'bottom') {
    return {
      xAnchor2: xEnd,
      yAnchor2: yEnd - (yEnd - yStart) / 2,
    };
  }

  if (endingAnchorOrientation === 'left' || endingAnchorOrientation === 'right') {
    return {
      xAnchor2: xEnd - (xEnd - xStart) / 2,
      yAnchor2: yEnd,
    };
  }

  return {
    xAnchor2: xEnd,
    yAnchor2: yEnd,
  };
}

//Calculate the two points of the curve converted from the end point
export function computeEndingCurvePosition(
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  roundCorner: number,
  endingAnchorOrientation: AnchorPositionType,
): {
  xAnchor2_1: number;
  yAnchor2_1: number;
  xAnchor2_2: number;
  yAnchor2_2: number;
} {
  let curvature = roundCorner;
  if (endingAnchorOrientation === 'top' || endingAnchorOrientation === 'bottom') {
    return {
      xAnchor2_1: xEnd - Math.sign(xEnd - xStart) * curvature,
      yAnchor2_1: yEnd - (yEnd - yStart) / 2,
      xAnchor2_2: xEnd,
      yAnchor2_2: yEnd - (yEnd - yStart) / 2 - Math.sign(xEnd - xStart) * curvature,
    };
  }

  if (endingAnchorOrientation === 'left' || endingAnchorOrientation === 'right') {
    return {
      xAnchor2_1: xEnd - (xEnd - xStart) / 2,
      yAnchor2_1: yEnd - Math.sign(yEnd - yStart) * curvature,
      xAnchor2_2: xEnd - (xEnd - xStart) / 2 + Math.sign(xEnd - xStart) * curvature,
      yAnchor2_2: yEnd,
    };
  }

  return {
    xAnchor2_1: xEnd,
    yAnchor2_1: yEnd,
    xAnchor2_2: xEnd,
    yAnchor2_2: yEnd,
  };
}

export function computeLabelDimensions(
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
): {
  xLabel: number;
  yLabel: number;
  labelWidth: number;
  labelHeight: number;
} {
  const labelWidth = Math.max(Math.abs(xEnd - xStart), 1);
  const labelHeight = Math.max(Math.abs(yEnd - yStart), 1);
  const xLabel = xEnd > xStart ? xStart : xEnd;
  const yLabel = yEnd > yStart ? yStart : yEnd;
  return {
    xLabel,
    yLabel,
    labelWidth,
    labelHeight,
  };
}

function computePathString({
  xStart,
  yStart,
  xAnchor1,
  yAnchor1,
  xAnchor1_1,
  yAnchor1_1,
  xAnchor1_2,
  yAnchor1_2,
  xAnchor2,
  yAnchor2,
  xAnchor2_1,
  yAnchor2_1,
  xAnchor2_2,
  yAnchor2_2,
  xEnd,
  yEnd,
  lineStyle,
  offset,
  lineGroupType,
  roundCorner,
}: {
  xStart: number;
  yStart: number;
  xAnchor1: number;
  yAnchor1: number;
  xAnchor1_1?: number;
  yAnchor1_1?: number;
  xAnchor1_2?: number;
  yAnchor1_2?: number;
  xAnchor2: number;
  yAnchor2: number;
  xAnchor2_1?: number;
  yAnchor2_1?: number;
  xAnchor2_2?: number;
  yAnchor2_2?: number;
  xEnd: number;
  yEnd: number;
  lineStyle: string;
  offset?: number;
  lineGroupType?: LineGroupType;
  roundCorner?: number;
}): string {
  const oldYStart = yStart;
  const oldYEnd = yEnd;

  if (offset && offset !== 0) {
    const angle =
      lineStyle === 'straight'
        ? Math.atan2(yEnd - yStart, xEnd - xStart)
        : Math.atan2(yAnchor1 - yStart, xAnchor1 - xStart);
    const xOffset = offset * Math.cos(angle);
    const yOffset = offset * Math.sin(angle);

    if (lineStyle !== 'straight') {
      xStart = xStart + xOffset;
      yStart = yStart + yOffset;
    }

    xEnd = xEnd - xOffset;
    yEnd = yEnd - yOffset;
  }

  let linePath = `M${xStart},${yStart} `;

  if (['curve', 'angle'].includes(lineStyle)) {
    if (lineStyle === 'curve') {
      linePath += `${
        lineStyle === 'curve' ? 'C' : ''
      }${xAnchor1},${yAnchor1} ${xAnchor2},${yAnchor2} `;
    } else {
      if (roundCorner) {
        if (lineGroupType == LineGroupType.Up) {
          if (yStart == yEnd) {
            linePath += `${xAnchor1},${yAnchor1} ${xAnchor2},${yAnchor2} `;
          } else if (yStart < yEnd) {
            return '';
          } else {
            let toRight = true;
            if (xStart < xEnd) {
              toRight = true;
            } else {
              toRight = false;
            }
            linePath += `${xAnchor1_1},${yAnchor1_1}  A5,5 0 0,${
              toRight ? 0 : 1
            } ${xAnchor1_2},${yAnchor1_2} L${xAnchor2_1},${yAnchor2_1}  A5,5 0 0,${
              toRight ? 1 : 0
            } ${xAnchor2_2},${yAnchor2_2} L`;
          }
        } else if (lineGroupType == LineGroupType.Down) {
          if (oldYStart == oldYEnd) {
            linePath += `${xAnchor1},${yAnchor1} ${xAnchor2},${yAnchor2} `;
          } else if (oldYStart > oldYEnd) {
            return '';
          } else {
            let toRight = true;
            if (xStart < xEnd) {
              toRight = true;
            } else {
              toRight = false;
            }
            linePath += `${xAnchor1_1},${yAnchor1_1}  A5,5 0 0,${
              toRight ? 1 : 0
            } ${xAnchor1_2},${yAnchor1_2}L${xAnchor2_1},${yAnchor2_1}  A5,5 0 0,${
              toRight ? 0 : 1
            } ${xAnchor2_2},${yAnchor2_2} L`;
          }
        } else {
          linePath += `${xAnchor1},${yAnchor1} ${xAnchor2},${yAnchor2} `;
        }
      } else {
        linePath += `${xAnchor1},${yAnchor1} ${xAnchor2},${yAnchor2} `;
      }
    }
    // linePath += `${
    //   lineStyle === 'curve' ? 'C' : ''
    // }${xAnchor1},${yAnchor1} ${xAnchor2},${yAnchor2} `;
  }
  linePath += `${xEnd},${yEnd}`;
  return linePath;
}

const SvgArrow = ({
  className,
  startingPoint,
  startingAnchorOrientation,
  endingPoint,
  endingAnchorOrientation,
  strokeColor,
  strokeWidth,
  strokeDasharray,
  arrowLabel,
  arrowMarkerId,
  lineStyle,
  offset,
  enableStartMarker,
  disableEndMarker,
  endShape,
  domAttributes,
  hitSlop = 10,
  cursor = 'pointer',
  lineGroupType,
  roundCorner,
}: Props) => {
  const actualArrowLength = endShape.circle
    ? endShape.circle.radius * 2
    : endShape.arrow.arrowLength * 2;

  // Starting point with arrow
  const { xPoint: xStart, yPoint: yStart } = computeArrowPointAccordingToArrowHead(
    startingPoint.x,
    startingPoint.y,
    enableStartMarker ? actualArrowLength : 0,
    strokeWidth,
    startingAnchorOrientation,
    lineStyle,
    endingPoint.x,
    endingPoint.y,
  );

  // Ending point with arrow
  const { xPoint: xEnd, yPoint: yEnd } = computeArrowPointAccordingToArrowHead(
    endingPoint.x,
    endingPoint.y,
    disableEndMarker ? 0 : actualArrowLength,
    strokeWidth,
    endingAnchorOrientation,
    lineStyle,
    startingPoint.x,
    startingPoint.y,
  );

  // Starting position
  const { xAnchor1, yAnchor1 } = computeStartingAnchorPosition(
    xStart,
    yStart,
    xEnd,
    yEnd,
    startingAnchorOrientation,
  );

  // Ending position
  const { xAnchor2, yAnchor2 } = computeEndingAnchorPosition(
    xStart,
    yStart,
    xEnd,
    yEnd,
    endingAnchorOrientation,
  );
  let anchorProps = {};
  if (lineStyle == 'angle' && roundCorner) {
    //Calculate the two points of the curve converted from the Starting position
    const { xAnchor1_1, yAnchor1_1, xAnchor1_2, yAnchor1_2 } = computeStartingCurvePosition(
      xStart,
      yStart,
      xEnd,
      yEnd,
      roundCorner,
      startingAnchorOrientation,
    );

    // Calculate the two points of the curve converted from the Ending position
    const { xAnchor2_1, yAnchor2_1, xAnchor2_2, yAnchor2_2 } = computeEndingCurvePosition(
      xStart,
      yStart,
      xEnd,
      yEnd,
      roundCorner,
      endingAnchorOrientation,
    );

    anchorProps = {
      xAnchor1_1,
      yAnchor1_1,
      xAnchor1_2,
      yAnchor1_2,
      xAnchor2_1,
      yAnchor2_1,
      xAnchor2_2,
      yAnchor2_2,
    };
  }

  const pathString = computePathString({
    xStart,
    yStart,
    xAnchor1,
    yAnchor1,
    xAnchor2,
    yAnchor2,
    xEnd,
    yEnd,
    lineStyle,
    offset,
    lineGroupType,
    roundCorner,
    ...anchorProps,
  });

  const { xLabel, yLabel, labelWidth, labelHeight } = computeLabelDimensions(
    xStart,
    yStart,
    xEnd,
    yEnd,
  );

  const markerUrl = `url(#${arrowMarkerId})`;

  return (
    <g className={className}>
      <path
        d={pathString}
        style={{
          fill: 'none',
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
        }}
        markerStart={enableStartMarker ? markerUrl : undefined}
        markerEnd={disableEndMarker ? undefined : markerUrl}
      />

      {/* This a thicker fake path to grab DOM events - makes clicking on the arrow more usable */}
      {domAttributes && (
        <path
          d={pathString}
          style={{
            fill: 'none',
            stroke: 'rgba(0, 0, 0, 0)',
            strokeWidth: hitSlop,
            cursor: domAttributes ? cursor : 'initial',
            pointerEvents: 'all',
          }}
          {...domAttributes}
        />
      )}

      {arrowLabel && (
        <foreignObject
          x={xLabel}
          y={yLabel}
          width={labelWidth}
          height={labelHeight}
          style={{
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translateX(-50%) translateY(-50%)',
              pointerEvents: 'all',
            }}
          >
            <div>{arrowLabel}</div>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default SvgArrow;
