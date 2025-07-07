import React from 'react';
import { Property } from 'csstype';
import Vector2 from '../../geometry/Vector2';
import {
  getPointCoordinatesFromAnchorPosition,
  getPointFromElement,
} from '../../geometry/rectHelper';
import SvgArrow, { computeArrowPointAccordingToArrowHead } from '../../SvgArrow/SvgArrow';

import { SourceToTargetType, LineGroupType } from '../../types';
import { createShapeObj, getMarkerId, getSourceToTargets } from '../ArcherContainer.helpers';
import { ArcherContainerProps, SourceToTargetsArrayType } from '../ArcherContainer.types';

interface CommonProps {
  startMarker: ArcherContainerProps['startMarker'];
  endMarker: ArcherContainerProps['endMarker'];
  endShape: NonNullable<ArcherContainerProps['endShape']>;
  strokeColor: NonNullable<ArcherContainerProps['strokeColor']>;
  strokeWidth: NonNullable<ArcherContainerProps['strokeWidth']>;
  strokeDasharray: ArcherContainerProps['strokeDasharray'];
  noCurves: ArcherContainerProps['noCurves'];
  lineStyle: ArcherContainerProps['lineStyle'];
  offset: ArcherContainerProps['offset'];
  uniqueId: string;
  refs: Record<string, HTMLElement>;
  hitSlop?: number;
  cursor?: Property.Cursor;
  lineGroupType?: LineGroupType;
  roundCorner?: ArcherContainerProps['roundCorner'];
}

const AdaptedArrow = (
  props: Omit<SourceToTargetType, 'order'> &
    CommonProps & {
      parentCoordinates: Vector2;
    },
) => {
  const style = props.style || {};
  const newStartMarker = style.startMarker || props.startMarker;
  const newEndMarker = style.endMarker ?? props.endMarker ?? true;

  const newEndShape = createShapeObj(style, props.endShape);

  const domAttributes = props.domAttributes;
  const cursor = props.cursor;
  const hitSlop = props.hitSlop;
  const newStrokeColor = style.strokeColor || props.strokeColor;
  const newStrokeWidth = style.strokeWidth || props.strokeWidth;
  const newStrokeDasharray = style.strokeDasharray || props.strokeDasharray;
  const newNoCurves = !!(style.noCurves || props.noCurves);
  const newLineStyle = style.lineStyle || props.lineStyle || (newNoCurves ? 'angle' : 'curve');
  const newOffset = props.offset || 0;
  const startingAnchorOrientation = props.source.anchor;

  const startingPoint = getPointCoordinatesFromAnchorPosition(
    props.source.anchor,
    props.source.id,
    props.parentCoordinates,
    props.refs,
  );

  const endingAnchorOrientation = props.target.anchor;

  const endingPoint = getPointCoordinatesFromAnchorPosition(
    props.target.anchor,
    props.target.id,
    props.parentCoordinates,
    props.refs,
  );

  if (!startingPoint) {
    console.warn('[React Archer] Could not find starting point of element! Not drawing the arrow.');
    return null;
  }

  if (!endingPoint) {
    console.warn('[React Archer] Could not find target element! Not drawing the arrow.');
    return null;
  }

  return (
    <SvgArrow
      className={props.className}
      startingPoint={startingPoint}
      startingAnchorOrientation={startingAnchorOrientation}
      endingPoint={endingPoint}
      endingAnchorOrientation={endingAnchorOrientation}
      strokeColor={newStrokeColor}
      strokeWidth={newStrokeWidth}
      strokeDasharray={newStrokeDasharray}
      arrowLabel={props.label}
      arrowMarkerId={getMarkerId(props.uniqueId, props.source, props.target)}
      lineStyle={newLineStyle}
      offset={newOffset}
      enableStartMarker={!!newStartMarker}
      disableEndMarker={!newEndMarker}
      endShape={newEndShape}
      domAttributes={domAttributes}
      hitSlop={hitSlop}
      cursor={cursor}
      roundCorner={props.roundCorner}
      lineGroupType={props.lineGroupType}
    />
  );
};

export const SvgArrows = (
  props: {
    parentCurrent: HTMLDivElement | null | undefined;
    sourceToTargetsMap: Record<string, SourceToTargetsArrayType>;
  } & CommonProps,
) => {
  const parentCoordinates = getPointFromElement(props.parentCurrent);

  if (!parentCoordinates) {
    // This happens when parent ref is not ready yet
    return null;
  }

  let lineGroupType = LineGroupType.None;
  if (props.noCurves && props.roundCorner) {
    let startYs: number[] = [];
    let endYs: number[] = [];
    for (const currentRelation of getSourceToTargets(props.sourceToTargetsMap)) {
      let source = currentRelation.source;
      let target = currentRelation.target;

      const startingPoint = getPointCoordinatesFromAnchorPosition(
        source.anchor,
        source.id,
        parentCoordinates,
        props.refs,
      );

      const endingAnchorOrientation = target.anchor;

      const endingPoint = getPointCoordinatesFromAnchorPosition(
        target.anchor,
        target.id,
        parentCoordinates,
        props.refs,
      );

      if (!startingPoint) {
        console.warn(
          '[React Archer] Could not find starting point of element! Not drawing the arrow.',
        );
        return null;
      }

      if (!endingPoint) {
        console.warn('[React Archer] Could not find target element! Not drawing the arrow.');
        return null;
      }
      const startingAnchorOrientation = source.anchor;
      const style = currentRelation.style || {};
      const newStartMarker = style.startMarker || props.startMarker;
      const newEndMarker = style.endMarker ?? props.endMarker ?? true;
      const newStrokeWidth = style.strokeWidth || props.strokeWidth;
      const newNoCurves = !!(style.noCurves || props.noCurves);
      const newLineStyle = style.lineStyle || props.lineStyle || (newNoCurves ? 'angle' : 'curve');
      const newEndShape = createShapeObj(style, props.endShape);
      const lineStyle = newLineStyle;
      const strokeWidth = newStrokeWidth;

      const enableStartMarker = !!newStartMarker;
      const disableEndMarker = !newEndMarker;
      const endShape = newEndShape as Record<string, any>;
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

      startYs.push(yStart);
      endYs.push(yEnd);
    }

    const yStartMin = Math.min(...startYs);
    const yStartMax = Math.max(...startYs);

    const yEndMin = Math.min(...endYs);
    const yEndMax = Math.max(...endYs);

    if (yStartMax >= yEndMax && yStartMin >= yEndMin) {
      lineGroupType = LineGroupType.Up; //Rise S
    } else if (yStartMax <= yEndMax && yStartMin <= yEndMin) {
      lineGroupType = LineGroupType.Down; //Drop S
    } else if (yStartMax > yEndMax && yStartMin < yEndMin) {
      lineGroupType = LineGroupType.Shrink; //Left surround
    } else if (yStartMax < yEndMax && yStartMin > yEndMin) {
      lineGroupType = LineGroupType.Expand; //Right surround
    }
  }
  return (
    <>
      {getSourceToTargets(props.sourceToTargetsMap).map((currentRelation) => (
        <AdaptedArrow
          key={JSON.stringify({
            source: currentRelation.source,
            target: currentRelation.target,
          })}
          source={currentRelation.source}
          target={currentRelation.target}
          className={currentRelation.className}
          label={currentRelation.label}
          style={currentRelation.style || {}}
          domAttributes={currentRelation.domAttributes}
          hitSlop={currentRelation.hitSlop}
          cursor={currentRelation.cursor}
          startMarker={props.startMarker}
          endMarker={props.endMarker}
          endShape={props.endShape}
          strokeColor={props.strokeColor}
          strokeWidth={props.strokeWidth}
          strokeDasharray={props.strokeDasharray}
          noCurves={props.noCurves}
          lineStyle={props.lineStyle}
          offset={props.offset}
          parentCoordinates={parentCoordinates}
          refs={props.refs}
          uniqueId={props.uniqueId}
          lineGroupType={lineGroupType}
          roundCorner={props.roundCorner}
        />
      ))}
    </>
  );
};
