// node_modules/@tanstack/virtual-core/dist/esm/utils.js
function memo(getDeps, fn, opts) {
  let deps = opts.initialDeps ?? [];
  let result;
  let isInitial = true;
  function memoizedFunction() {
    var _a, _b, _c;
    let depTime;
    if (opts.key && ((_a = opts.debug) == null ? undefined : _a.call(opts)))
      depTime = Date.now();
    const newDeps = getDeps();
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep);
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    let resultTime;
    if (opts.key && ((_b = opts.debug) == null ? undefined : _b.call(opts)))
      resultTime = Date.now();
    result = fn(...newDeps);
    if (opts.key && ((_c = opts.debug) == null ? undefined : _c.call(opts))) {
      const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
      const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
      const resultFpsPercentage = resultEndTime / 16;
      const pad = (str, num) => {
        str = String(str);
        while (str.length < num) {
          str = " " + str;
        }
        return str;
      };
      console.info(`%c⏱ ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * resultFpsPercentage, 120))}deg 100% 31%);`, opts == null ? undefined : opts.key);
    }
    if ((opts == null ? undefined : opts.onChange) && !(isInitial && opts.skipInitialOnChange)) {
      opts.onChange(result);
    }
    isInitial = false;
    return result;
  }
  memoizedFunction.updateDeps = (newDeps) => {
    deps = newDeps;
  };
  return memoizedFunction;
}
function notUndefined(value, msg) {
  if (value === undefined) {
    throw new Error(`Unexpected undefined${msg ? `: ${msg}` : ""}`);
  } else {
    return value;
  }
}
var approxEqual = (a, b) => Math.abs(a - b) < 1.01;
var debounce = (targetWindow, fn, ms) => {
  let timeoutId;
  return function(...args) {
    targetWindow.clearTimeout(timeoutId);
    timeoutId = targetWindow.setTimeout(() => fn.apply(this, args), ms);
  };
};

// node_modules/@tanstack/virtual-core/dist/esm/index.js
var getRect = (element) => {
  const { offsetWidth, offsetHeight } = element;
  return { width: offsetWidth, height: offsetHeight };
};
var defaultKeyExtractor = (index) => index;
var defaultRangeExtractor = (range) => {
  const start = Math.max(range.startIndex - range.overscan, 0);
  const end = Math.min(range.endIndex + range.overscan, range.count - 1);
  const arr = [];
  for (let i = start;i <= end; i++) {
    arr.push(i);
  }
  return arr;
};
var observeElementRect = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  const handler = (rect) => {
    const { width, height } = rect;
    cb({ width: Math.round(width), height: Math.round(height) });
  };
  handler(getRect(element));
  if (!targetWindow.ResizeObserver) {
    return () => {};
  }
  const observer = new targetWindow.ResizeObserver((entries) => {
    const run = () => {
      const entry = entries[0];
      if (entry == null ? undefined : entry.borderBoxSize) {
        const box = entry.borderBoxSize[0];
        if (box) {
          handler({ width: box.inlineSize, height: box.blockSize });
          return;
        }
      }
      handler(getRect(element));
    };
    instance.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
  });
  observer.observe(element, { box: "border-box" });
  return () => {
    observer.unobserve(element);
  };
};
var addEventListenerOptions = {
  passive: true
};
var supportsScrollend = typeof window == "undefined" ? true : ("onscrollend" in window);
var observeElementOffset = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  let offset = 0;
  const fallback = instance.options.useScrollendEvent && supportsScrollend ? () => {
    return;
  } : debounce(targetWindow, () => {
    cb(offset, false);
  }, instance.options.isScrollingResetDelay);
  const createHandler = (isScrolling) => () => {
    const { horizontal, isRtl } = instance.options;
    offset = horizontal ? element["scrollLeft"] * (isRtl && -1 || 1) : element["scrollTop"];
    fallback();
    cb(offset, isScrolling);
  };
  const handler = createHandler(true);
  const endHandler = createHandler(false);
  element.addEventListener("scroll", handler, addEventListenerOptions);
  const registerScrollendEvent = instance.options.useScrollendEvent && supportsScrollend;
  if (registerScrollendEvent) {
    element.addEventListener("scrollend", endHandler, addEventListenerOptions);
  }
  return () => {
    element.removeEventListener("scroll", handler);
    if (registerScrollendEvent) {
      element.removeEventListener("scrollend", endHandler);
    }
  };
};
var measureElement = (element, entry, instance) => {
  if (entry == null ? undefined : entry.borderBoxSize) {
    const box = entry.borderBoxSize[0];
    if (box) {
      const size = Math.round(box[instance.options.horizontal ? "inlineSize" : "blockSize"]);
      return size;
    }
  }
  return element[instance.options.horizontal ? "offsetWidth" : "offsetHeight"];
};
var elementScroll = (offset, {
  adjustments = 0,
  behavior
}, instance) => {
  var _a, _b;
  const toOffset = offset + adjustments;
  (_b = (_a = instance.scrollElement) == null ? undefined : _a.scrollTo) == null || _b.call(_a, {
    [instance.options.horizontal ? "left" : "top"]: toOffset,
    behavior
  });
};

class Virtualizer {
  constructor(opts) {
    this.unsubs = [];
    this.scrollElement = null;
    this.targetWindow = null;
    this.isScrolling = false;
    this.scrollState = null;
    this.measurementsCache = [];
    this.itemSizeCache = /* @__PURE__ */ new Map;
    this.laneAssignments = /* @__PURE__ */ new Map;
    this.pendingMeasuredCacheIndexes = [];
    this.prevLanes = undefined;
    this.lanesChangedFlag = false;
    this.lanesSettling = false;
    this.scrollRect = null;
    this.scrollOffset = null;
    this.scrollDirection = null;
    this.scrollAdjustments = 0;
    this.elementsCache = /* @__PURE__ */ new Map;
    this.now = () => {
      var _a, _b, _c;
      return ((_c = (_b = (_a = this.targetWindow) == null ? undefined : _a.performance) == null ? undefined : _b.now) == null ? undefined : _c.call(_b)) ?? Date.now();
    };
    this.observer = /* @__PURE__ */ (() => {
      let _ro = null;
      const get = () => {
        if (_ro) {
          return _ro;
        }
        if (!this.targetWindow || !this.targetWindow.ResizeObserver) {
          return null;
        }
        return _ro = new this.targetWindow.ResizeObserver((entries) => {
          entries.forEach((entry) => {
            const run = () => {
              const node = entry.target;
              const index = this.indexFromElement(node);
              if (!node.isConnected) {
                this.observer.unobserve(node);
                return;
              }
              if (this.shouldMeasureDuringScroll(index)) {
                this.resizeItem(index, this.options.measureElement(node, entry, this));
              }
            };
            this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
          });
        });
      };
      return {
        disconnect: () => {
          var _a;
          (_a = get()) == null || _a.disconnect();
          _ro = null;
        },
        observe: (target) => {
          var _a;
          return (_a = get()) == null ? undefined : _a.observe(target, { box: "border-box" });
        },
        unobserve: (target) => {
          var _a;
          return (_a = get()) == null ? undefined : _a.unobserve(target);
        }
      };
    })();
    this.range = null;
    this.setOptions = (opts2) => {
      Object.entries(opts2).forEach(([key, value]) => {
        if (typeof value === "undefined")
          delete opts2[key];
      });
      this.options = {
        debug: false,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: false,
        getItemKey: defaultKeyExtractor,
        rangeExtractor: defaultRangeExtractor,
        onChange: () => {},
        measureElement,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        isScrollingResetDelay: 150,
        enabled: true,
        isRtl: false,
        useScrollendEvent: false,
        useAnimationFrameWithResizeObserver: false,
        laneAssignmentMode: "estimate",
        ...opts2
      };
    };
    this.notify = (sync) => {
      var _a, _b;
      (_b = (_a = this.options).onChange) == null || _b.call(_a, this, sync);
    };
    this.maybeNotify = memo(() => {
      this.calculateRange();
      return [
        this.isScrolling,
        this.range ? this.range.startIndex : null,
        this.range ? this.range.endIndex : null
      ];
    }, (isScrolling) => {
      this.notify(isScrolling);
    }, {
      key: "maybeNotify",
      debug: () => this.options.debug,
      initialDeps: [
        this.isScrolling,
        this.range ? this.range.startIndex : null,
        this.range ? this.range.endIndex : null
      ]
    });
    this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((d) => d());
      this.unsubs = [];
      this.observer.disconnect();
      if (this.rafId != null && this.targetWindow) {
        this.targetWindow.cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.scrollState = null;
      this.scrollElement = null;
      this.targetWindow = null;
    };
    this._didMount = () => {
      return () => {
        this.cleanup();
      };
    };
    this._willUpdate = () => {
      var _a;
      const scrollElement = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== scrollElement) {
        this.cleanup();
        if (!scrollElement) {
          this.maybeNotify();
          return;
        }
        this.scrollElement = scrollElement;
        if (this.scrollElement && "ownerDocument" in this.scrollElement) {
          this.targetWindow = this.scrollElement.ownerDocument.defaultView;
        } else {
          this.targetWindow = ((_a = this.scrollElement) == null ? undefined : _a.window) ?? null;
        }
        this.elementsCache.forEach((cached) => {
          this.observer.observe(cached);
        });
        this.unsubs.push(this.options.observeElementRect(this, (rect) => {
          this.scrollRect = rect;
          this.maybeNotify();
        }));
        this.unsubs.push(this.options.observeElementOffset(this, (offset, isScrolling) => {
          this.scrollAdjustments = 0;
          this.scrollDirection = isScrolling ? this.getScrollOffset() < offset ? "forward" : "backward" : null;
          this.scrollOffset = offset;
          this.isScrolling = isScrolling;
          if (this.scrollState) {
            this.scheduleScrollReconcile();
          }
          this.maybeNotify();
        }));
        this._scrollToOffset(this.getScrollOffset(), {
          adjustments: undefined,
          behavior: undefined
        });
      }
    };
    this.rafId = null;
    this.getSize = () => {
      if (!this.options.enabled) {
        this.scrollRect = null;
        return 0;
      }
      this.scrollRect = this.scrollRect ?? this.options.initialRect;
      return this.scrollRect[this.options.horizontal ? "width" : "height"];
    };
    this.getScrollOffset = () => {
      if (!this.options.enabled) {
        this.scrollOffset = null;
        return 0;
      }
      this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset === "function" ? this.options.initialOffset() : this.options.initialOffset);
      return this.scrollOffset;
    };
    this.getFurthestMeasurement = (measurements, index) => {
      const furthestMeasurementsFound = /* @__PURE__ */ new Map;
      const furthestMeasurements = /* @__PURE__ */ new Map;
      for (let m = index - 1;m >= 0; m--) {
        const measurement = measurements[m];
        if (furthestMeasurementsFound.has(measurement.lane)) {
          continue;
        }
        const previousFurthestMeasurement = furthestMeasurements.get(measurement.lane);
        if (previousFurthestMeasurement == null || measurement.end > previousFurthestMeasurement.end) {
          furthestMeasurements.set(measurement.lane, measurement);
        } else if (measurement.end < previousFurthestMeasurement.end) {
          furthestMeasurementsFound.set(measurement.lane, true);
        }
        if (furthestMeasurementsFound.size === this.options.lanes) {
          break;
        }
      }
      return furthestMeasurements.size === this.options.lanes ? Array.from(furthestMeasurements.values()).sort((a, b) => {
        if (a.end === b.end) {
          return a.index - b.index;
        }
        return a.end - b.end;
      })[0] : undefined;
    };
    this.getMeasurementOptions = memo(() => [
      this.options.count,
      this.options.paddingStart,
      this.options.scrollMargin,
      this.options.getItemKey,
      this.options.enabled,
      this.options.lanes,
      this.options.laneAssignmentMode
    ], (count, paddingStart, scrollMargin, getItemKey, enabled, lanes, laneAssignmentMode) => {
      const lanesChanged = this.prevLanes !== undefined && this.prevLanes !== lanes;
      if (lanesChanged) {
        this.lanesChangedFlag = true;
      }
      this.prevLanes = lanes;
      this.pendingMeasuredCacheIndexes = [];
      return {
        count,
        paddingStart,
        scrollMargin,
        getItemKey,
        enabled,
        lanes,
        laneAssignmentMode
      };
    }, {
      key: false
    });
    this.getMeasurements = memo(() => [this.getMeasurementOptions(), this.itemSizeCache], ({
      count,
      paddingStart,
      scrollMargin,
      getItemKey,
      enabled,
      lanes,
      laneAssignmentMode
    }, itemSizeCache) => {
      if (!enabled) {
        this.measurementsCache = [];
        this.itemSizeCache.clear();
        this.laneAssignments.clear();
        return [];
      }
      if (this.laneAssignments.size > count) {
        for (const index of this.laneAssignments.keys()) {
          if (index >= count) {
            this.laneAssignments.delete(index);
          }
        }
      }
      if (this.lanesChangedFlag) {
        this.lanesChangedFlag = false;
        this.lanesSettling = true;
        this.measurementsCache = [];
        this.itemSizeCache.clear();
        this.laneAssignments.clear();
        this.pendingMeasuredCacheIndexes = [];
      }
      if (this.measurementsCache.length === 0 && !this.lanesSettling) {
        this.measurementsCache = this.options.initialMeasurementsCache;
        this.measurementsCache.forEach((item) => {
          this.itemSizeCache.set(item.key, item.size);
        });
      }
      const min = this.lanesSettling ? 0 : this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
      this.pendingMeasuredCacheIndexes = [];
      if (this.lanesSettling && this.measurementsCache.length === count) {
        this.lanesSettling = false;
      }
      const measurements = this.measurementsCache.slice(0, min);
      const laneLastIndex = new Array(lanes).fill(undefined);
      for (let m = 0;m < min; m++) {
        const item = measurements[m];
        if (item) {
          laneLastIndex[item.lane] = m;
        }
      }
      for (let i = min;i < count; i++) {
        const key = getItemKey(i);
        const cachedLane = this.laneAssignments.get(i);
        let lane;
        let start;
        const shouldCacheLane = laneAssignmentMode === "estimate" || itemSizeCache.has(key);
        if (cachedLane !== undefined && this.options.lanes > 1) {
          lane = cachedLane;
          const prevIndex = laneLastIndex[lane];
          const prevInLane = prevIndex !== undefined ? measurements[prevIndex] : undefined;
          start = prevInLane ? prevInLane.end + this.options.gap : paddingStart + scrollMargin;
        } else {
          const furthestMeasurement = this.options.lanes === 1 ? measurements[i - 1] : this.getFurthestMeasurement(measurements, i);
          start = furthestMeasurement ? furthestMeasurement.end + this.options.gap : paddingStart + scrollMargin;
          lane = furthestMeasurement ? furthestMeasurement.lane : i % this.options.lanes;
          if (this.options.lanes > 1 && shouldCacheLane) {
            this.laneAssignments.set(i, lane);
          }
        }
        const measuredSize = itemSizeCache.get(key);
        const size = typeof measuredSize === "number" ? measuredSize : this.options.estimateSize(i);
        const end = start + size;
        measurements[i] = {
          index: i,
          start,
          size,
          end,
          key,
          lane
        };
        laneLastIndex[lane] = i;
      }
      this.measurementsCache = measurements;
      return measurements;
    }, {
      key: "getMeasurements",
      debug: () => this.options.debug
    });
    this.calculateRange = memo(() => [
      this.getMeasurements(),
      this.getSize(),
      this.getScrollOffset(),
      this.options.lanes
    ], (measurements, outerSize, scrollOffset, lanes) => {
      return this.range = measurements.length > 0 && outerSize > 0 ? calculateRange({
        measurements,
        outerSize,
        scrollOffset,
        lanes
      }) : null;
    }, {
      key: "calculateRange",
      debug: () => this.options.debug
    });
    this.getVirtualIndexes = memo(() => {
      let startIndex = null;
      let endIndex = null;
      const range = this.calculateRange();
      if (range) {
        startIndex = range.startIndex;
        endIndex = range.endIndex;
      }
      this.maybeNotify.updateDeps([this.isScrolling, startIndex, endIndex]);
      return [
        this.options.rangeExtractor,
        this.options.overscan,
        this.options.count,
        startIndex,
        endIndex
      ];
    }, (rangeExtractor, overscan, count, startIndex, endIndex) => {
      return startIndex === null || endIndex === null ? [] : rangeExtractor({
        startIndex,
        endIndex,
        overscan,
        count
      });
    }, {
      key: "getVirtualIndexes",
      debug: () => this.options.debug
    });
    this.indexFromElement = (node) => {
      const attributeName = this.options.indexAttribute;
      const indexStr = node.getAttribute(attributeName);
      if (!indexStr) {
        console.warn(`Missing attribute name '${attributeName}={index}' on measured element.`);
        return -1;
      }
      return parseInt(indexStr, 10);
    };
    this.shouldMeasureDuringScroll = (index) => {
      var _a;
      if (!this.scrollState || this.scrollState.behavior !== "smooth") {
        return true;
      }
      const scrollIndex = this.scrollState.index ?? ((_a = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset)) == null ? undefined : _a.index);
      if (scrollIndex !== undefined && this.range) {
        const bufferSize = Math.max(this.options.overscan, Math.ceil((this.range.endIndex - this.range.startIndex) / 2));
        const minIndex = Math.max(0, scrollIndex - bufferSize);
        const maxIndex = Math.min(this.options.count - 1, scrollIndex + bufferSize);
        return index >= minIndex && index <= maxIndex;
      }
      return true;
    };
    this.measureElement = (node) => {
      if (!node) {
        this.elementsCache.forEach((cached, key2) => {
          if (!cached.isConnected) {
            this.observer.unobserve(cached);
            this.elementsCache.delete(key2);
          }
        });
        return;
      }
      const index = this.indexFromElement(node);
      const key = this.options.getItemKey(index);
      const prevNode = this.elementsCache.get(key);
      if (prevNode !== node) {
        if (prevNode) {
          this.observer.unobserve(prevNode);
        }
        this.observer.observe(node);
        this.elementsCache.set(key, node);
      }
      if ((!this.isScrolling || this.scrollState) && this.shouldMeasureDuringScroll(index)) {
        this.resizeItem(index, this.options.measureElement(node, undefined, this));
      }
    };
    this.resizeItem = (index, size) => {
      var _a;
      const item = this.measurementsCache[index];
      if (!item)
        return;
      const itemSize = this.itemSizeCache.get(item.key) ?? item.size;
      const delta = size - itemSize;
      if (delta !== 0) {
        if (((_a = this.scrollState) == null ? undefined : _a.behavior) !== "smooth" && (this.shouldAdjustScrollPositionOnItemSizeChange !== undefined ? this.shouldAdjustScrollPositionOnItemSizeChange(item, delta, this) : item.start < this.getScrollOffset() + this.scrollAdjustments)) {
          if (this.options.debug) {
            console.info("correction", delta);
          }
          this._scrollToOffset(this.getScrollOffset(), {
            adjustments: this.scrollAdjustments += delta,
            behavior: undefined
          });
        }
        this.pendingMeasuredCacheIndexes.push(item.index);
        this.itemSizeCache = new Map(this.itemSizeCache.set(item.key, size));
        this.notify(false);
      }
    };
    this.getVirtualItems = memo(() => [this.getVirtualIndexes(), this.getMeasurements()], (indexes, measurements) => {
      const virtualItems = [];
      for (let k = 0, len = indexes.length;k < len; k++) {
        const i = indexes[k];
        const measurement = measurements[i];
        virtualItems.push(measurement);
      }
      return virtualItems;
    }, {
      key: "getVirtualItems",
      debug: () => this.options.debug
    });
    this.getVirtualItemForOffset = (offset) => {
      const measurements = this.getMeasurements();
      if (measurements.length === 0) {
        return;
      }
      return notUndefined(measurements[findNearestBinarySearch(0, measurements.length - 1, (index) => notUndefined(measurements[index]).start, offset)]);
    };
    this.getMaxScrollOffset = () => {
      if (!this.scrollElement)
        return 0;
      if ("scrollHeight" in this.scrollElement) {
        return this.options.horizontal ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
      } else {
        const doc = this.scrollElement.document.documentElement;
        return this.options.horizontal ? doc.scrollWidth - this.scrollElement.innerWidth : doc.scrollHeight - this.scrollElement.innerHeight;
      }
    };
    this.getOffsetForAlignment = (toOffset, align, itemSize = 0) => {
      if (!this.scrollElement)
        return 0;
      const size = this.getSize();
      const scrollOffset = this.getScrollOffset();
      if (align === "auto") {
        align = toOffset >= scrollOffset + size ? "end" : "start";
      }
      if (align === "center") {
        toOffset += (itemSize - size) / 2;
      } else if (align === "end") {
        toOffset -= size;
      }
      const maxOffset = this.getMaxScrollOffset();
      return Math.max(Math.min(maxOffset, toOffset), 0);
    };
    this.getOffsetForIndex = (index, align = "auto") => {
      index = Math.max(0, Math.min(index, this.options.count - 1));
      const size = this.getSize();
      const scrollOffset = this.getScrollOffset();
      const item = this.measurementsCache[index];
      if (!item)
        return;
      if (align === "auto") {
        if (item.end >= scrollOffset + size - this.options.scrollPaddingEnd) {
          align = "end";
        } else if (item.start <= scrollOffset + this.options.scrollPaddingStart) {
          align = "start";
        } else {
          return [scrollOffset, align];
        }
      }
      if (align === "end" && index === this.options.count - 1) {
        return [this.getMaxScrollOffset(), align];
      }
      const toOffset = align === "end" ? item.end + this.options.scrollPaddingEnd : item.start - this.options.scrollPaddingStart;
      return [
        this.getOffsetForAlignment(toOffset, align, item.size),
        align
      ];
    };
    this.scrollToOffset = (toOffset, { align = "start", behavior = "auto" } = {}) => {
      const offset = this.getOffsetForAlignment(toOffset, align);
      const now = this.now();
      this.scrollState = {
        index: null,
        align,
        behavior,
        startedAt: now,
        lastTargetOffset: offset,
        stableFrames: 0
      };
      this._scrollToOffset(offset, { adjustments: undefined, behavior });
      this.scheduleScrollReconcile();
    };
    this.scrollToIndex = (index, {
      align: initialAlign = "auto",
      behavior = "auto"
    } = {}) => {
      index = Math.max(0, Math.min(index, this.options.count - 1));
      const offsetInfo = this.getOffsetForIndex(index, initialAlign);
      if (!offsetInfo) {
        return;
      }
      const [offset, align] = offsetInfo;
      const now = this.now();
      this.scrollState = {
        index,
        align,
        behavior,
        startedAt: now,
        lastTargetOffset: offset,
        stableFrames: 0
      };
      this._scrollToOffset(offset, { adjustments: undefined, behavior });
      this.scheduleScrollReconcile();
    };
    this.scrollBy = (delta, { behavior = "auto" } = {}) => {
      const offset = this.getScrollOffset() + delta;
      const now = this.now();
      this.scrollState = {
        index: null,
        align: "start",
        behavior,
        startedAt: now,
        lastTargetOffset: offset,
        stableFrames: 0
      };
      this._scrollToOffset(offset, { adjustments: undefined, behavior });
      this.scheduleScrollReconcile();
    };
    this.getTotalSize = () => {
      var _a;
      const measurements = this.getMeasurements();
      let end;
      if (measurements.length === 0) {
        end = this.options.paddingStart;
      } else if (this.options.lanes === 1) {
        end = ((_a = measurements[measurements.length - 1]) == null ? undefined : _a.end) ?? 0;
      } else {
        const endByLane = Array(this.options.lanes).fill(null);
        let endIndex = measurements.length - 1;
        while (endIndex >= 0 && endByLane.some((val) => val === null)) {
          const item = measurements[endIndex];
          if (endByLane[item.lane] === null) {
            endByLane[item.lane] = item.end;
          }
          endIndex--;
        }
        end = Math.max(...endByLane.filter((val) => val !== null));
      }
      return Math.max(end - this.options.scrollMargin + this.options.paddingEnd, 0);
    };
    this._scrollToOffset = (offset, {
      adjustments,
      behavior
    }) => {
      this.options.scrollToFn(offset, { behavior, adjustments }, this);
    };
    this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map;
      this.laneAssignments = /* @__PURE__ */ new Map;
      this.notify(false);
    };
    this.setOptions(opts);
  }
  scheduleScrollReconcile() {
    if (!this.targetWindow) {
      this.scrollState = null;
      return;
    }
    if (this.rafId != null)
      return;
    this.rafId = this.targetWindow.requestAnimationFrame(() => {
      this.rafId = null;
      this.reconcileScroll();
    });
  }
  reconcileScroll() {
    if (!this.scrollState)
      return;
    const el = this.scrollElement;
    if (!el)
      return;
    const MAX_RECONCILE_MS = 5000;
    if (this.now() - this.scrollState.startedAt > MAX_RECONCILE_MS) {
      this.scrollState = null;
      return;
    }
    const offsetInfo = this.scrollState.index != null ? this.getOffsetForIndex(this.scrollState.index, this.scrollState.align) : undefined;
    const targetOffset = offsetInfo ? offsetInfo[0] : this.scrollState.lastTargetOffset;
    const STABLE_FRAMES = 1;
    const targetChanged = targetOffset !== this.scrollState.lastTargetOffset;
    if (!targetChanged && approxEqual(targetOffset, this.getScrollOffset())) {
      this.scrollState.stableFrames++;
      if (this.scrollState.stableFrames >= STABLE_FRAMES) {
        this.scrollState = null;
        return;
      }
    } else {
      this.scrollState.stableFrames = 0;
      if (targetChanged) {
        this.scrollState.lastTargetOffset = targetOffset;
        this.scrollState.behavior = "auto";
        this._scrollToOffset(targetOffset, {
          adjustments: undefined,
          behavior: "auto"
        });
      }
    }
    this.scheduleScrollReconcile();
  }
}
var findNearestBinarySearch = (low, high, getCurrentValue, value) => {
  while (low <= high) {
    const middle = (low + high) / 2 | 0;
    const currentValue = getCurrentValue(middle);
    if (currentValue < value) {
      low = middle + 1;
    } else if (currentValue > value) {
      high = middle - 1;
    } else {
      return middle;
    }
  }
  if (low > 0) {
    return low - 1;
  } else {
    return 0;
  }
};
function calculateRange({
  measurements,
  outerSize,
  scrollOffset,
  lanes
}) {
  const lastIndex = measurements.length - 1;
  const getOffset = (index) => measurements[index].start;
  if (measurements.length <= lanes) {
    return {
      startIndex: 0,
      endIndex: lastIndex
    };
  }
  let startIndex = findNearestBinarySearch(0, lastIndex, getOffset, scrollOffset);
  let endIndex = startIndex;
  if (lanes === 1) {
    while (endIndex < lastIndex && measurements[endIndex].end < scrollOffset + outerSize) {
      endIndex++;
    }
  } else if (lanes > 1) {
    const endPerLane = Array(lanes).fill(0);
    while (endIndex < lastIndex && endPerLane.some((pos) => pos < scrollOffset + outerSize)) {
      const item = measurements[endIndex];
      endPerLane[item.lane] = item.end;
      endIndex++;
    }
    const startPerLane = Array(lanes).fill(scrollOffset + outerSize);
    while (startIndex >= 0 && startPerLane.some((pos) => pos >= scrollOffset)) {
      const item = measurements[startIndex];
      startPerLane[item.lane] = item.start;
      startIndex--;
    }
    startIndex = Math.max(0, startIndex - startIndex % lanes);
    endIndex = Math.min(lastIndex, endIndex + (lanes - 1 - endIndex % lanes));
  }
  return { startIndex, endIndex };
}

// src/frontend.ts
function setup(ctx) {
  const tab = ctx.ui.registerDrawerTab({
    id: "chatroom_settings",
    title: "Council Chatroom",
    shortName: "Chatroom",
    description: "Configure the Council Chatroom overlay",
    iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
  });
  function makeInteractive(el) {
    const stop = (e) => e.stopPropagation();
    el.addEventListener("mousedown", stop, false);
    el.addEventListener("touchstart", stop, { passive: true, capture: false });
    el.addEventListener("pointerdown", stop, false);
    el.addEventListener("click", stop, false);
    el.addEventListener("keydown", stop, false);
  }
  const settingsContainer = document.createElement("div");
  settingsContainer.style.cssText = `
    padding: 20px;
    color: var(--lumiverse-text);
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: var(--lumiverse-font-family, system-ui, -apple-system, sans-serif);
  `;
  const headerSection = document.createElement("div");
  headerSection.style.cssText = `
    display: flex; flex-direction: column; gap: 4px;
  `;
  const titleEl = document.createElement("h3");
  titleEl.textContent = "Council Chatroom Overlay";
  titleEl.style.cssText = `
    margin: 0; font-size: 16px; font-weight: 600;
    color: var(--lumiverse-text); letter-spacing: -0.01em;
  `;
  const descEl = document.createElement("p");
  descEl.textContent = "Configure how your council members react to the story. Toggle the floating widget below or use the controls in the chatroom itself.";
  descEl.style.cssText = `
    margin: 0; font-size: 12px; color: var(--lumiverse-text-dim);
    line-height: 1.5;
  `;
  headerSection.appendChild(titleEl);
  headerSection.appendChild(descEl);
  settingsContainer.appendChild(headerSection);
  const toggleCard = document.createElement("div");
  toggleCard.style.cssText = `
    background: var(--lumiverse-fill-subtle);
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 10px);
    padding: 14px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  `;
  const toggleInfo = document.createElement("div");
  toggleInfo.style.cssText = "display: flex; flex-direction: column; gap: 2px;";
  const toggleLabel = document.createElement("span");
  toggleLabel.textContent = "Floating Widget";
  toggleLabel.style.cssText = "font-size: 13px; font-weight: 600; color: var(--lumiverse-text);";
  const toggleHint = document.createElement("span");
  toggleHint.textContent = "Show or hide the chatroom overlay";
  toggleHint.style.cssText = "font-size: 11px; color: var(--lumiverse-text-dim); line-height: 1.4;";
  toggleInfo.appendChild(toggleLabel);
  toggleInfo.appendChild(toggleHint);
  const toggleBtn = document.createElement("button");
  makeInteractive(toggleBtn);
  toggleBtn.textContent = "Toggle Visibility";
  toggleBtn.style.cssText = `
    padding: 8px 14px;
    background: var(--lumiverse-fill-subtle);
    color: var(--lumiverse-text);
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 8px);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: background .15s, border-color .15s;
    flex-shrink: 0;
  `;
  toggleBtn.addEventListener("mouseenter", () => {
    toggleBtn.style.background = "var(--lumiverse-fill-hover)";
    toggleBtn.style.borderColor = "var(--lumiverse-border-hover)";
  });
  toggleBtn.addEventListener("mouseleave", () => {
    toggleBtn.style.background = "var(--lumiverse-fill-subtle)";
    toggleBtn.style.borderColor = "var(--lumiverse-border)";
  });
  toggleBtn.addEventListener("click", () => {
    setWidgetVisible(!widgetVisible);
  });
  toggleCard.appendChild(toggleInfo);
  toggleCard.appendChild(toggleBtn);
  settingsContainer.appendChild(toggleCard);
  const configCard = document.createElement("div");
  configCard.style.cssText = `
    background: var(--lumiverse-fill-subtle);
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 10px);
    padding: 16px;
    display: flex; flex-direction: column; gap: 16px;
  `;
  const configHeader = document.createElement("div");
  configHeader.style.cssText = `
    display: flex; align-items: center; gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--lumiverse-border);
  `;
  const configHeaderIcon = document.createElement("span");
  configHeaderIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.67 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
  configHeaderIcon.style.cssText = "color: var(--lumiverse-primary); display: flex; flex-shrink: 0;";
  const configTitle = document.createElement("h4");
  configTitle.textContent = "Chatroom Configuration";
  configTitle.style.cssText = "margin: 0; font-size: 15px; font-weight: 600; color: var(--lumiverse-text);";
  configHeader.appendChild(configHeaderIcon);
  configHeader.appendChild(configTitle);
  configCard.appendChild(configHeader);
  const chatroomNameInput = createStyledTextInput("Council Chatroom");
  configCard.appendChild(createSettingRow("Chatroom Name", "A custom name for this chatroom. Saved per-chat and shown in the widget header.", chatroomNameInput));
  function createSettingRow(labelText, description, control) {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; flex-direction: column; gap: 6px;";
    const labelWrap = document.createElement("div");
    labelWrap.style.cssText = "display: flex; flex-direction: column; gap: 2px;";
    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.cssText = "font-size: 12px; font-weight: 500; color: var(--lumiverse-text-muted); letter-spacing: 0.03em; text-transform: uppercase;";
    const desc = document.createElement("span");
    desc.textContent = description;
    desc.style.cssText = "font-size: 11px; color: var(--lumiverse-text-dim); line-height: 1.45;";
    labelWrap.appendChild(label);
    labelWrap.appendChild(desc);
    control.style.alignSelf = "flex-start";
    row.appendChild(labelWrap);
    row.appendChild(control);
    return row;
  }
  function createStyledSelect() {
    const sel = document.createElement("select");
    makeInteractive(sel);
    sel.style.cssText = `
      padding: 6px 10px;
      border: 1px solid var(--lumiverse-border);
      border-radius: var(--lumiverse-radius, 8px);
      background: var(--lumiverse-fill-subtle);
      color: var(--lumiverse-text);
      font-size: 13px;
      outline: none;
      min-width: 240px;
      cursor: pointer;
      transition: border-color .15s;
    `;
    sel.addEventListener("focus", () => {
      sel.style.borderColor = "var(--lumiverse-primary)";
    });
    sel.addEventListener("blur", () => {
      sel.style.borderColor = "var(--lumiverse-border)";
    });
    return sel;
  }
  function createStyledNumberInput(min, max, value, step) {
    const inp = document.createElement("input");
    makeInteractive(inp);
    inp.type = "number";
    inp.min = min;
    inp.max = max;
    inp.value = value;
    if (step)
      inp.step = step;
    inp.style.cssText = `
      width: 100px;
      padding: 6px 10px;
      border: 1px solid var(--lumiverse-border);
      border-radius: var(--lumiverse-radius, 8px);
      background: var(--lumiverse-fill-subtle);
      color: var(--lumiverse-text);
      font-size: 13px;
      outline: none;
      transition: border-color .15s;
    `;
    inp.addEventListener("focus", () => {
      inp.style.borderColor = "var(--lumiverse-primary)";
    });
    inp.addEventListener("blur", () => {
      inp.style.borderColor = "var(--lumiverse-border)";
    });
    return inp;
  }
  function parseOptionalNumber(value) {
    const trimmed = value.trim();
    if (!trimmed)
      return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  function createStyledTextInput(placeholder) {
    const inp = document.createElement("input");
    makeInteractive(inp);
    inp.type = "text";
    inp.placeholder = placeholder;
    inp.style.cssText = `
      width: 100%;
      max-width: 400px;
      padding: 6px 10px;
      border: 1px solid var(--lumiverse-border);
      border-radius: var(--lumiverse-radius, 8px);
      background: var(--lumiverse-fill-subtle);
      color: var(--lumiverse-text);
      font-size: 13px;
      outline: none;
      transition: border-color .15s;
      box-sizing: border-box;
    `;
    inp.addEventListener("focus", () => {
      inp.style.borderColor = "var(--lumiverse-primary)";
    });
    inp.addEventListener("blur", () => {
      inp.style.borderColor = "var(--lumiverse-border)";
    });
    return inp;
  }
  const connectionSelect = createStyledSelect();
  connectionSelect.innerHTML = '<option value="">Default Active Connection</option>';
  configCard.appendChild(createSettingRow("Generation Connection Profile", "The LLM connection used to generate council messages.", connectionSelect));
  const triggerModeSelect = createStyledSelect();
  triggerModeSelect.innerHTML = `
    <option value="time">Time-based (seconds)</option>
    <option value="messages">Message-based (chat messages)</option>
  `;
  configCard.appendChild(createSettingRow("Auto-Reply Trigger", "Choose whether council auto-replies are triggered by elapsed time or by the number of story chat messages sent.", triggerModeSelect));
  const timeSettingsGroup = document.createElement("div");
  timeSettingsGroup.style.cssText = "display: flex; flex-direction: column; gap: 16px;";
  const messageIntervalInput = createStyledNumberInput("1", "3600", "10");
  timeSettingsGroup.appendChild(createSettingRow("Time Between Messages (seconds)", "How long to wait before generating the next council message.", messageIntervalInput));
  const randomToggleRow = document.createElement("div");
  randomToggleRow.style.cssText = "display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; padding: 4px 0;";
  const randomToggleCheckbox = document.createElement("input");
  randomToggleCheckbox.type = "checkbox";
  randomToggleCheckbox.style.cssText = "width: 16px; height: 16px; cursor: pointer; accent-color: var(--lumiverse-primary); flex-shrink: 0;";
  const randomToggleLabel = document.createElement("span");
  randomToggleLabel.textContent = "Use Random Message Interval";
  randomToggleLabel.style.cssText = "font-size: 13px; font-weight: 500; color: var(--lumiverse-text);";
  randomToggleRow.appendChild(randomToggleCheckbox);
  randomToggleRow.appendChild(randomToggleLabel);
  makeInteractive(randomToggleCheckbox);
  timeSettingsGroup.appendChild(createSettingRow("Random Interval", "When enabled, the delay between messages varies randomly within the range below.", randomToggleRow));
  const intervalRangeWrap = document.createElement("div");
  intervalRangeWrap.style.cssText = "display: flex; gap: 12px; align-items: center;";
  const intervalMinInput = createStyledNumberInput("1", "60", "5");
  const intervalMaxInput = createStyledNumberInput("1", "120", "15");
  const minWrap = document.createElement("div");
  minWrap.style.cssText = "display: flex; flex-direction: column; gap: 4px;";
  const minLabel = document.createElement("span");
  minLabel.textContent = "Min (s)";
  minLabel.style.cssText = "font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;";
  minWrap.appendChild(minLabel);
  minWrap.appendChild(intervalMinInput);
  const maxWrap = document.createElement("div");
  maxWrap.style.cssText = "display: flex; flex-direction: column; gap: 4px;";
  const maxLabel = document.createElement("span");
  maxLabel.textContent = "Max (s)";
  maxLabel.style.cssText = "font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;";
  maxWrap.appendChild(maxLabel);
  maxWrap.appendChild(intervalMaxInput);
  const rangeArrow = document.createElement("span");
  rangeArrow.textContent = "→";
  rangeArrow.style.cssText = "color: var(--lumiverse-text-dim); font-size: 12px; padding-top: 18px; font-weight: 500;";
  intervalRangeWrap.appendChild(minWrap);
  intervalRangeWrap.appendChild(rangeArrow);
  intervalRangeWrap.appendChild(maxWrap);
  const rangeRow = createSettingRow("Random Interval Range", "Council messages will be spaced by a random duration between these two values.", intervalRangeWrap);
  timeSettingsGroup.appendChild(rangeRow);
  configCard.appendChild(timeSettingsGroup);
  const messagesSettingsGroup = document.createElement("div");
  messagesSettingsGroup.style.cssText = "display: none; flex-direction: column; gap: 16px;";
  const messageCountInput = createStyledNumberInput("1", "100", "5");
  messagesSettingsGroup.appendChild(createSettingRow("Messages Between Responses", "How many story chat messages must be sent before the council auto-replies.", messageCountInput));
  const randomMessageCountRow = document.createElement("div");
  randomMessageCountRow.style.cssText = "display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; padding: 4px 0;";
  const randomMessageCountCheckbox = document.createElement("input");
  randomMessageCountCheckbox.type = "checkbox";
  randomMessageCountCheckbox.style.cssText = "width: 16px; height: 16px; cursor: pointer; accent-color: var(--lumiverse-primary); flex-shrink: 0;";
  const randomMessageCountLabel = document.createElement("span");
  randomMessageCountLabel.textContent = "Use Random Message Count";
  randomMessageCountLabel.style.cssText = "font-size: 13px; font-weight: 500; color: var(--lumiverse-text);";
  randomMessageCountRow.appendChild(randomMessageCountCheckbox);
  randomMessageCountRow.appendChild(randomMessageCountLabel);
  makeInteractive(randomMessageCountCheckbox);
  messagesSettingsGroup.appendChild(createSettingRow("Random Message Count", "When enabled, the number of messages required varies randomly within the range below.", randomMessageCountRow));
  const messageCountRangeWrap = document.createElement("div");
  messageCountRangeWrap.style.cssText = "display: flex; gap: 12px; align-items: center;";
  const messageCountMinInput = createStyledNumberInput("1", "100", "3");
  const messageCountMaxInput = createStyledNumberInput("1", "100", "7");
  const msgMinWrap = document.createElement("div");
  msgMinWrap.style.cssText = "display: flex; flex-direction: column; gap: 4px;";
  const msgMinLabel = document.createElement("span");
  msgMinLabel.textContent = "Min";
  msgMinLabel.style.cssText = "font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;";
  msgMinWrap.appendChild(msgMinLabel);
  msgMinWrap.appendChild(messageCountMinInput);
  const msgMaxWrap = document.createElement("div");
  msgMaxWrap.style.cssText = "display: flex; flex-direction: column; gap: 4px;";
  const msgMaxLabel = document.createElement("span");
  msgMaxLabel.textContent = "Max";
  msgMaxLabel.style.cssText = "font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;";
  msgMaxWrap.appendChild(msgMaxLabel);
  msgMaxWrap.appendChild(messageCountMaxInput);
  const msgRangeArrow = document.createElement("span");
  msgRangeArrow.textContent = "→";
  msgRangeArrow.style.cssText = "color: var(--lumiverse-text-dim); font-size: 12px; padding-top: 18px; font-weight: 500;";
  messageCountRangeWrap.appendChild(msgMinWrap);
  messageCountRangeWrap.appendChild(msgRangeArrow);
  messageCountRangeWrap.appendChild(msgMaxWrap);
  const messageCountRangeRow = createSettingRow("Random Message Count Range", "Council will auto-reply after a random number of story messages between these two values.", messageCountRangeWrap);
  messagesSettingsGroup.appendChild(messageCountRangeRow);
  configCard.appendChild(messagesSettingsGroup);
  function updateTimeRangeVisibility() {
    rangeRow.style.display = randomToggleCheckbox.checked ? "flex" : "none";
    messageIntervalInput.disabled = randomToggleCheckbox.checked;
    messageIntervalInput.style.opacity = randomToggleCheckbox.checked ? "0.5" : "1";
  }
  randomToggleCheckbox.addEventListener("change", updateTimeRangeVisibility);
  function updateMessageCountRangeVisibility() {
    messageCountRangeRow.style.display = randomMessageCountCheckbox.checked ? "flex" : "none";
    messageCountInput.disabled = randomMessageCountCheckbox.checked;
    messageCountInput.style.opacity = randomMessageCountCheckbox.checked ? "0.5" : "1";
  }
  randomMessageCountCheckbox.addEventListener("change", updateMessageCountRangeVisibility);
  function updateTriggerMode() {
    const isTime = triggerModeSelect.value === "time";
    timeSettingsGroup.style.display = isTime ? "flex" : "none";
    messagesSettingsGroup.style.display = isTime ? "none" : "flex";
  }
  triggerModeSelect.addEventListener("change", updateTriggerMode);
  const contextInput = createStyledNumberInput("1", "50", "10");
  configCard.appendChild(createSettingRow("Context Retrieval (messages)", "How many recent story messages the council can see before reacting.", contextInput));
  const maxContextTokensInput = createStyledNumberInput("512", "32768", "4096");
  configCard.appendChild(createSettingRow("Max Context Tokens", "Maximum tokens the council chatroom history can consume. Older messages are removed automatically when this limit is exceeded.", maxContextTokensInput));
  const advancedGenerationGroup = document.createElement("div");
  advancedGenerationGroup.style.cssText = "display: flex; flex-direction: column; gap: 14px;";
  const advancedGenerationHeader = document.createElement("div");
  advancedGenerationHeader.textContent = "Advanced Generation";
  advancedGenerationHeader.style.cssText = "padding-top: 6px; font-size: 12px; font-weight: 700; color: var(--lumiverse-text); letter-spacing: 0.04em; text-transform: uppercase;";
  advancedGenerationGroup.appendChild(advancedGenerationHeader);
  const temperatureInput = createStyledNumberInput("0", "2", "", "0.05");
  temperatureInput.placeholder = "1";
  advancedGenerationGroup.appendChild(createSettingRow("Temperature", "Higher values increase randomness. Leave blank to use the default of 1. A value of 0 omits temperature from the request.", temperatureInput));
  const topPInput = createStyledNumberInput("0", "1", "", "0.01");
  topPInput.placeholder = "0.95";
  advancedGenerationGroup.appendChild(createSettingRow("Top P", "Nucleus sampling cutoff. Leave blank to use the default of 0.95. A value of 0 omits top_p from the request.", topPInput));
  const topKWrap = document.createElement("div");
  topKWrap.style.cssText = "display: flex; align-items: center; gap: 10px; flex-wrap: wrap;";
  const topKEnabledCheckbox = document.createElement("input");
  topKEnabledCheckbox.type = "checkbox";
  makeInteractive(topKEnabledCheckbox);
  const topKEnabledLabel = document.createElement("label");
  topKEnabledLabel.textContent = "Include top_k";
  topKEnabledLabel.style.cssText = "font-size: 12px; color: var(--lumiverse-text);";
  const topKInput = createStyledNumberInput("0", "1000", "0");
  topKWrap.appendChild(topKEnabledCheckbox);
  topKWrap.appendChild(topKEnabledLabel);
  topKWrap.appendChild(topKInput);
  function updateTopKVisibility() {
    topKInput.disabled = !topKEnabledCheckbox.checked;
    topKInput.style.opacity = topKEnabledCheckbox.checked ? "1" : "0.5";
  }
  topKEnabledCheckbox.addEventListener("change", updateTopKVisibility);
  updateTopKVisibility();
  advancedGenerationGroup.appendChild(createSettingRow("Top K", "Enable to include top_k in the request. When enabled, 0 is allowed and sent as-is.", topKWrap));
  const maxResponseTokensInput = createStyledNumberInput("1", "32768", "");
  maxResponseTokensInput.placeholder = "8192";
  advancedGenerationGroup.appendChild(createSettingRow("Max Response Tokens", "Maximum completion tokens to request. Leave blank to use the default of 8192.", maxResponseTokensInput));
  configCard.appendChild(advancedGenerationGroup);
  const saveBtnWrap = document.createElement("div");
  saveBtnWrap.style.cssText = "display: flex; gap: 10px; padding-top: 8px;";
  const saveBtn = document.createElement("button");
  makeInteractive(saveBtn);
  saveBtn.textContent = "Save Configuration";
  saveBtn.style.cssText = `
    padding: 8px 16px;
    background: var(--lumiverse-primary);
    color: white;
    border: none;
    border-radius: var(--lumiverse-radius, 8px);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: filter .15s, transform .1s;
  `;
  saveBtn.addEventListener("mouseenter", () => saveBtn.style.filter = "brightness(1.1)");
  saveBtn.addEventListener("mouseleave", () => saveBtn.style.filter = "none");
  saveBtn.addEventListener("mousedown", () => saveBtn.style.transform = "scale(0.97)");
  saveBtn.addEventListener("mouseup", () => saveBtn.style.transform = "none");
  saveBtn.addEventListener("click", () => {
    ctx.sendToBackend({
      type: "save_settings",
      triggerMode: triggerModeSelect.value,
      messageInterval: parseInt(messageIntervalInput.value, 10),
      randomIntervalEnabled: randomToggleCheckbox.checked,
      intervalMin: parseInt(intervalMinInput.value, 10),
      intervalMax: parseInt(intervalMaxInput.value, 10),
      messageCount: parseInt(messageCountInput.value, 10),
      randomMessageCountEnabled: randomMessageCountCheckbox.checked,
      messageCountMin: parseInt(messageCountMinInput.value, 10),
      messageCountMax: parseInt(messageCountMaxInput.value, 10),
      contextLimit: parseInt(contextInput.value, 10),
      maxContextTokens: parseInt(maxContextTokensInput.value, 10),
      temperature: parseOptionalNumber(temperatureInput.value),
      topP: parseOptionalNumber(topPInput.value),
      topKEnabled: topKEnabledCheckbox.checked,
      topK: topKEnabledCheckbox.checked ? parseOptionalNumber(topKInput.value) ?? 0 : null,
      maxResponseTokens: parseOptionalNumber(maxResponseTokensInput.value),
      connectionId: connectionSelect.value,
      chatroomName: chatroomNameInput.value.trim()
    });
  });
  saveBtnWrap.appendChild(saveBtn);
  const clearBtn = document.createElement("button");
  makeInteractive(clearBtn);
  clearBtn.textContent = "Clear Chat History";
  clearBtn.style.cssText = `
    padding: 8px 16px;
    background: transparent;
    color: var(--lumiverse-danger, #ef4444);
    border: 1px solid var(--lumiverse-danger, #ef4444);
    border-radius: var(--lumiverse-radius, 8px);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: filter .15s, transform .1s, background .15s;
  `;
  clearBtn.addEventListener("mouseenter", () => {
    clearBtn.style.background = "var(--lumiverse-danger-010, rgba(239,68,68,0.1))";
  });
  clearBtn.addEventListener("mouseleave", () => {
    clearBtn.style.background = "transparent";
  });
  clearBtn.addEventListener("mousedown", () => clearBtn.style.transform = "scale(0.97)");
  clearBtn.addEventListener("mouseup", () => clearBtn.style.transform = "none");
  clearBtn.addEventListener("click", () => {
    ctx.sendToBackend({ type: "clear_chat_history" });
  });
  saveBtnWrap.appendChild(clearBtn);
  configCard.appendChild(saveBtnWrap);
  settingsContainer.appendChild(configCard);
  tab.root.appendChild(settingsContainer);
  const isMobile = window.innerWidth <= 768 || "ontouchstart" in window;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const WIDGET_TRANSITION = prefersReducedMotion.matches ? "0ms linear" : "220ms cubic-bezier(0.22, 1, 0.36, 1)";
  const WIDGET_TRANSITION_FAST = prefersReducedMotion.matches ? "0ms linear" : "160ms cubic-bezier(0.4, 0, 0.2, 1)";
  const WIDGET_TRANSITION_MS = prefersReducedMotion.matches ? 0 : 220;
  function getDefaultWidgetSize() {
    return {
      width: isMobile ? Math.min(380, window.innerWidth - 16) : 440,
      height: isMobile ? Math.min(540, window.innerHeight - 80) : 620
    };
  }
  function getDefaultWidgetPosition() {
    return {
      x: isMobile ? 8 : window.innerWidth - 480,
      y: isMobile ? 40 : window.innerHeight - 660
    };
  }
  const defaultWidgetSize = getDefaultWidgetSize();
  const defaultWidgetPosition = getDefaultWidgetPosition();
  function isInChatView() {
    return /^\/chat\/[^/]+/.test(window.location.pathname);
  }
  const widget = ctx.ui.createFloatWidget({
    width: defaultWidgetSize.width,
    height: defaultWidgetSize.height,
    initialPosition: defaultWidgetPosition,
    snapToEdge: true,
    tooltip: "Council Chatroom",
    chromeless: true
  });
  ctx.dom.addStyle(`
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes msgIn { from { opacity:0; transform: translateY(6px) scale(.98); } to { opacity:1; transform: none; } }
    .chatroom-scroll::-webkit-scrollbar { width: 5px; }
    .chatroom-scroll::-webkit-scrollbar-track { background: transparent; }
    .chatroom-scroll::-webkit-scrollbar-thumb { background: var(--lumiverse-border); border-radius: 3px; }
    .chatroom-msg-entering { animation: msgIn .2s ease-out; }
    .chatroom-copy-btn { opacity: .45; transition: opacity .15s, background .15s, transform .1s; }
    .chatroom-copy-btn:hover, .chatroom-copy-btn:focus-visible { opacity: 1; }
    .chatroom-copy-btn:active { transform: scale(.96); }
    .chatroom-rich strong { font-weight: 700; }
    .chatroom-rich em { font-style: italic; }
  `);
  let autoTimer = null;
  let triggerMode = "time";
  let messageInterval = 10;
  let randomIntervalEnabled = true;
  let intervalMin = 5;
  let intervalMax = 15;
  let messageCount = 5;
  let randomMessageCountEnabled = true;
  let messageCountMin = 3;
  let messageCountMax = 7;
  let isGenerating = false;
  function startAutoTimer() {
    if (autoTimer)
      clearTimeout(autoTimer);
    const scheduleNext = () => {
      let ms;
      if (randomIntervalEnabled) {
        ms = intervalMin * 1000 + Math.random() * ((intervalMax - intervalMin) * 1000);
      } else {
        ms = messageInterval * 1000;
      }
      autoTimer = setTimeout(() => {
        if (!isGenerating)
          ctx.sendToBackend({ type: "trigger_generation" });
        scheduleNext();
      }, ms);
    };
    scheduleNext();
  }
  function stopAutoTimer() {
    if (autoTimer)
      clearTimeout(autoTimer);
    autoTimer = null;
  }
  let isCollapsed = false;
  let isFullscreen = false;
  let preFullscreenState = null;
  let expandedHeight = 620;
  let unreadCount = 0;
  let lastSenderId = null;
  let userPersona = null;
  function hashHue(str) {
    let h = 0;
    for (let i = 0;i < str.length; i++)
      h = str.charCodeAt(i) + ((h << 5) - h);
    return Math.abs(h) % 360;
  }
  function memberColor(name) {
    const hue = hashHue(name);
    return `hsl(${hue}, 70%, 60%)`;
  }
  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function formatMessageContent(text) {
    let html = escapeHtml(text);
    html = html.replace(/\*\*\*([\s\S]+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([\s\S]+?)\*/g, "<em>$1</em>");
    return html.replace(/\n/g, "<br>");
  }
  async function copyToClipboard(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "true");
    fallback.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;";
    document.body.appendChild(fallback);
    fallback.select();
    fallback.setSelectionRange(0, fallback.value.length);
    const copied = document.execCommand("copy");
    document.body.removeChild(fallback);
    if (!copied) {
      throw new Error("Copy failed");
    }
  }
  const shell = widget.root.parentElement || widget.root;
  function getHostWrapper() {
    let el = shell;
    while (el.parentElement && el.parentElement !== document.body) {
      el = el.parentElement;
    }
    return el;
  }
  const hostWrapper = getHostWrapper();
  const sizedWidget = widget;
  function syncFullscreenStateFromHost() {
    if (typeof sizedWidget.isFullscreen === "function") {
      isFullscreen = sizedWidget.isFullscreen();
    }
    syncHeaderSafeAreaPadding();
    return isFullscreen;
  }
  function setWidgetSize(width, height) {
    shell.style.setProperty("width", width + "px", "important");
    shell.style.setProperty("height", height + "px", "important");
    sizedWidget.setSize?.(width, height);
  }
  function restoreSaneWidgetDefaults() {
    if (syncFullscreenStateFromHost()) {
      fsBtn.click();
    }
    const defaults = getDefaultWidgetSize();
    const pos = getDefaultWidgetPosition();
    expandedHeight = defaults.height;
    setWidgetSize(defaults.width, isCollapsed ? header.offsetHeight : defaults.height);
    widget.moveTo(pos.x, pos.y);
    requestAnimationFrame(() => {
      clampWidgetToViewport();
      persistWidgetState();
    });
  }
  function resetWidgetToSaneDefaults() {
    if (syncFullscreenStateFromHost()) {
      fsBtn.click();
    }
    const defaults = getDefaultWidgetSize();
    const pos = getDefaultWidgetPosition();
    expandedHeight = defaults.height;
    if (isCollapsed) {
      isCollapsed = false;
      setWidgetSize(defaults.width, defaults.height);
      updateCollapse();
    } else {
      setWidgetSize(defaults.width, defaults.height);
      syncHostWrapperSize();
    }
    widget.moveTo(pos.x, pos.y);
    requestAnimationFrame(() => {
      clampWidgetToViewport();
      persistWidgetState();
    });
  }
  widget.root.style.cssText = `
    width:100%;height:100%;
    display:flex;flex-direction:column;
    overflow:hidden;
  `;
  shell.style.cssText = `
    display:flex;flex-direction:column;
    width:100%;height:100%;
    background:var(--lumiverse-bg);
    color:var(--lumiverse-text);
    border-radius:20px;
    box-shadow:0 20px 60px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
    border:1px solid var(--lumiverse-border);
    overflow:hidden;
    font-family:var(--lumiverse-font-family, system-ui, -apple-system, sans-serif);
    position:relative;
    transform-origin:bottom right;
    will-change:width,height,transform,opacity,border-radius;
    transition:
      width var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION}),
      height var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION}),
      border-radius var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION}),
      box-shadow var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION}),
      opacity var(--lcs-chat-widget-transition-fast, ${WIDGET_TRANSITION_FAST}),
      transform var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION}),
      filter var(--lcs-chat-widget-transition-fast, ${WIDGET_TRANSITION_FAST});
  `;
  hostWrapper.style.setProperty("transform-origin", "bottom right");
  hostWrapper.style.setProperty("will-change", "width, height, transform, opacity");
  hostWrapper.style.setProperty("transition", [
    `width var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION})`,
    `height var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION})`,
    `opacity var(--lcs-chat-widget-transition-fast, ${WIDGET_TRANSITION_FAST})`,
    `transform var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION})`,
    `left var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION})`,
    `top var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION})`
  ].join(", "));
  function getTypographyPreferenceSignature() {
    const rootStyle = getComputedStyle(document.documentElement);
    return [
      rootStyle.getPropertyValue("--lumiverse-font-scale").trim() || "1",
      rootStyle.getPropertyValue("--lumiverse-font-family").trim() || ""
    ].join("|");
  }
  let typographyPreferenceSignature = "";
  function applyWidgetPreferenceVars() {
    shell.style.setProperty("--lcs-chat-font-scale", "var(--lumiverse-font-scale, 1)");
    shell.style.setProperty("--lcs-chat-name-font-size", "calc(11px * var(--lcs-chat-font-scale, 1))");
    shell.style.setProperty("--lcs-chat-message-font-size", "calc(13.5px * var(--lcs-chat-font-scale, 1))");
    shell.style.setProperty("--lcs-chat-meta-font-size", "calc(10px * var(--lcs-chat-font-scale, 1))");
    shell.style.setProperty("--lcs-chat-input-font-size", "calc(14px * var(--lcs-chat-font-scale, 1))");
    shell.style.setProperty("--lcs-chat-input-font-size-mobile", "max(16px, calc(14px * var(--lcs-chat-font-scale, 1)))");
    shell.style.setProperty("--lcs-chat-widget-transition", WIDGET_TRANSITION);
    shell.style.setProperty("--lcs-chat-widget-transition-fast", WIDGET_TRANSITION_FAST);
    const nextSignature = getTypographyPreferenceSignature();
    const changed = typographyPreferenceSignature !== "" && typographyPreferenceSignature !== nextSignature;
    typographyPreferenceSignature = nextSignature;
    return changed;
  }
  applyWidgetPreferenceVars();
  let widgetVisible = false;
  let requestedWidgetVisible = false;
  let widgetVisibilityTimer = null;
  function applyWidgetVisibility() {
    const visible = requestedWidgetVisible && isInChatView();
    widgetVisible = visible;
    if (widgetVisibilityTimer != null) {
      window.clearTimeout(widgetVisibilityTimer);
      widgetVisibilityTimer = null;
    }
    if (visible) {
      widget.setVisible(true);
      shell.style.visibility = "visible";
      shell.style.removeProperty("opacity");
      shell.style.removeProperty("filter");
      shell.style.pointerEvents = "auto";
      requestAnimationFrame(() => {
        shell.style.opacity = "1";
        shell.style.transform = "translateY(0) scale(1)";
      });
      const w = shell.offsetWidth;
      const h = shell.offsetHeight;
      if (w < 50 || h < 50) {
        restoreSaneWidgetDefaults();
        syncHostWrapperSize();
      }
    } else {
      shell.style.opacity = "0";
      shell.style.pointerEvents = "none";
      shell.style.transform = "translateY(12px) scale(0.975)";
      shell.style.filter = "saturate(0.92)";
      widgetVisibilityTimer = window.setTimeout(() => {
        shell.style.visibility = "hidden";
        shell.style.removeProperty("filter");
        widget.setVisible(false);
        widgetVisibilityTimer = null;
      }, WIDGET_TRANSITION_MS);
    }
  }
  function setWidgetVisible(visible) {
    const wasRequestedVisible = requestedWidgetVisible;
    requestedWidgetVisible = visible;
    applyWidgetVisibility();
    if (visible && !wasRequestedVisible && isInChatView()) {
      ctx.sendToBackend({ type: "sync_active_chat" });
    }
  }
  setWidgetVisible(false);
  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);
  const syncRouteVisibility = () => applyWidgetVisibility();
  window.history.pushState = function(...args) {
    const result = originalPushState(...args);
    syncRouteVisibility();
    return result;
  };
  window.history.replaceState = function(...args) {
    const result = originalReplaceState(...args);
    syncRouteVisibility();
    return result;
  };
  window.addEventListener("popstate", syncRouteVisibility);
  window.addEventListener("hashchange", syncRouteVisibility);
  const shellResizeObserver = new ResizeObserver((entries) => {
    if (!widgetVisible || isFullscreen)
      return;
    for (const entry of entries) {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w > 0 && h > 0) {
        syncHostWrapperSize();
      }
      if (w < 50 || h < 50) {
        restoreSaneWidgetDefaults();
        syncHostWrapperSize();
      }
    }
  });
  shellResizeObserver.observe(shell);
  function persistWidgetState() {
    if (isMobile)
      return;
    const pos = widget.getPosition();
    const persistedHeight = isCollapsed ? expandedHeight : shell.offsetHeight;
    ctx.sendToBackend({
      type: "save_widget_state",
      x: pos.x,
      y: pos.y,
      w: shell.offsetWidth,
      h: persistedHeight,
      collapsed: isCollapsed
    });
  }
  function persistCollapsedState() {
    if (isMobile)
      return;
    ctx.sendToBackend({
      type: "save_widget_state",
      collapsed: isCollapsed
    });
  }
  function clampWidgetToViewport() {
    if (isFullscreen)
      return;
    const pos = widget.getPosition();
    const rect = shell.getBoundingClientRect();
    let nx = pos.x;
    let ny = pos.y;
    const pad = 8;
    if (nx < pad)
      nx = pad;
    if (nx + rect.width > window.innerWidth - pad)
      nx = Math.max(pad, window.innerWidth - rect.width - pad);
    if (ny < pad)
      ny = pad;
    if (ny + rect.height > window.innerHeight - pad)
      ny = Math.max(pad, window.innerHeight - rect.height - pad);
    if (nx !== pos.x || ny !== pos.y) {
      widget.moveTo(nx, ny);
    }
  }
  widget.onDragEnd(() => {
    clampWidgetToViewport();
    persistWidgetState();
  });
  const header = document.createElement("div");
  header.style.cssText = `
    padding:14px 18px;
    background:linear-gradient(180deg, var(--lumiverse-fill-subtle) 0%, var(--lumiverse-fill) 100%);
    border-bottom:1px solid var(--lumiverse-border);
    display:flex;align-items:center;gap:12px;
    flex-shrink:0;cursor:grab;user-select:none;
    position:relative;
  `;
  function syncHeaderSafeAreaPadding() {
    const useSafeAreaInsets = isFullscreen && isMobile;
    header.style.paddingTop = useSafeAreaInsets ? "calc(14px + env(safe-area-inset-top, 0px))" : "14px";
    header.style.paddingRight = useSafeAreaInsets ? "calc(18px + env(safe-area-inset-right, 0px))" : "18px";
    header.style.paddingBottom = "14px";
    header.style.paddingLeft = useSafeAreaInsets ? "calc(18px + env(safe-area-inset-left, 0px))" : "18px";
  }
  syncHeaderSafeAreaPadding();
  const headerLeft = document.createElement("div");
  headerLeft.style.cssText = "display:flex;align-items:center;gap:10px;flex:1;min-width:0;";
  const headerIcon = document.createElement("div");
  headerIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  headerIcon.style.cssText = "display:flex;color:var(--lumiverse-primary);flex-shrink:0;";
  const headerTextWrap = document.createElement("div");
  headerTextWrap.style.cssText = "display:flex;flex-direction:column;gap:1px;min-width:0;";
  const headerTitle = document.createElement("span");
  headerTitle.textContent = "Council Chatroom";
  headerTitle.style.cssText = "font-weight:700;font-size:14px;color:var(--lumiverse-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
  const headerSubtitle = document.createElement("span");
  headerSubtitle.textContent = "Watching the story unfold…";
  headerSubtitle.style.cssText = "font-size:11px;color:var(--lumiverse-text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
  headerTextWrap.appendChild(headerTitle);
  headerTextWrap.appendChild(headerSubtitle);
  const badge = document.createElement("span");
  badge.style.cssText = `
    display:none;background:var(--lumiverse-primary);color:white;
    font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;
    min-width:16px;text-align:center;flex-shrink:0;margin-left:4px;
  `;
  headerLeft.appendChild(headerIcon);
  headerLeft.appendChild(headerTextWrap);
  headerLeft.appendChild(badge);
  const headerActions = document.createElement("div");
  headerActions.style.cssText = "display:flex;align-items:center;gap:2px;flex-shrink:0;";
  function iconBtn(html, title) {
    const b = document.createElement("button");
    b.innerHTML = html;
    b.title = title;
    b.style.cssText = `
      display:flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:var(--lumiverse-radius,6px);
      background:transparent;border:none;color:var(--lumiverse-text-muted);
      cursor:pointer;transition:all .15s;
    `;
    b.addEventListener("mouseenter", () => {
      b.style.background = "var(--lumiverse-fill-hover)";
      b.style.color = "var(--lumiverse-text)";
    });
    b.addEventListener("mouseleave", () => {
      b.style.background = "transparent";
      b.style.color = "var(--lumiverse-text-muted)";
    });
    b.addEventListener("click", (e) => e.stopPropagation());
    return b;
  }
  const fsBtn = iconBtn(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`, "Fullscreen");
  const collapseBtn = iconBtn(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`, "Collapse");
  const hideBtn = iconBtn(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`, "Hide");
  let collapsedContextMenuOpen = false;
  async function openCollapsedContextMenu(position) {
    if (collapsedContextMenuOpen)
      return;
    collapsedContextMenuOpen = true;
    try {
      const result = await ctx.ui.showContextMenu({
        position,
        items: [
          { key: "reset", label: "Reset Position" },
          { key: "hide", label: "Hide Widget" }
        ]
      });
      if (result.selectedKey === "reset") {
        resetWidgetToSaneDefaults();
      } else if (result.selectedKey === "hide") {
        setWidgetVisible(false);
      }
    } finally {
      collapsedContextMenuOpen = false;
    }
  }
  const handleCollapsedContextMenu = (e) => {
    const mouseEvent = e;
    if (!isCollapsed)
      return;
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    openCollapsedContextMenu({ x: mouseEvent.clientX, y: mouseEvent.clientY });
  };
  hostWrapper.addEventListener("contextmenu", handleCollapsedContextMenu, true);
  headerActions.appendChild(fsBtn);
  headerActions.appendChild(collapseBtn);
  headerActions.appendChild(hideBtn);
  header.appendChild(headerLeft);
  header.appendChild(headerActions);
  widget.root.appendChild(header);
  let isDragging = false;
  let dragStart = { x: 0, y: 0, wx: 0, wy: 0 };
  header.addEventListener("mousedown", (e) => {
    if (e.target.closest("button"))
      return;
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    header.style.cursor = "grabbing";
    const pos = widget.getPosition();
    dragStart = { x: e.clientX, y: e.clientY, wx: pos.x, wy: pos.y };
  });
  document.addEventListener("mousemove", (e) => {
    if (!isDragging)
      return;
    widget.moveTo(dragStart.wx + (e.clientX - dragStart.x), dragStart.wy + (e.clientY - dragStart.y));
  });
  document.addEventListener("mouseup", () => {
    if (!isDragging)
      return;
    isDragging = false;
    header.style.cursor = "grab";
    clampWidgetToViewport();
    persistWidgetState();
  });
  const body = document.createElement("div");
  body.style.cssText = `
    flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;
    opacity:1;transform:translateY(0) scale(1);transform-origin:top center;
    transition:
      opacity var(--lcs-chat-widget-transition-fast, ${WIDGET_TRANSITION_FAST}),
      transform var(--lcs-chat-widget-transition-fast, ${WIDGET_TRANSITION_FAST});
  `;
  const messageList = document.createElement("div");
  messageList.className = "chatroom-scroll";
  messageList.style.cssText = `
    flex:1;overflow-y:auto;overflow-x:hidden;
    min-height:0;position:relative;box-sizing:border-box;
    padding:0 16px;overflow-anchor:none;
  `;
  const virtualContent = document.createElement("div");
  virtualContent.style.cssText = "position:relative;width:100%;min-height:100%;";
  messageList.appendChild(virtualContent);
  body.appendChild(messageList);
  let allMessages = [];
  const msgHeightCache = new Map;
  const ESTIMATED_MSG_HEIGHT = 60;
  const VIRTUAL_OVERSCAN = isMobile ? 4 : 6;
  const VIRTUAL_LIST_PADDING = 16;
  let isStickToBottom = true;
  let pendingUserRetryCandidateIndex = null;
  let currentGenerationRetryCandidateIndex = null;
  let typingPlaceholderVisible = false;
  let typingPlaceholderSpeakerName = null;
  let localUserMessageCounter = 0;
  let localMessageCounter = 0;
  const animatedMessageIds = new Set;
  let ignoreScrollTrackingUntil = 0;
  let bottomScrollRaf = null;
  let pendingBottomScrollBehavior = null;
  let virtualRenderRaf = null;
  let pendingRenderShouldStickToBottom = false;
  const renderedRows = new Map;
  const dirtyMeasurementKeys = new Set;
  function invalidateVirtualMeasurements(shouldScrollToBottom = isStickToBottom) {
    msgHeightCache.clear();
    dirtyMeasurementKeys.clear();
    rowVirtualizer.measure();
    refreshVirtualizer(shouldScrollToBottom, "auto");
  }
  function isGroupedAt(index) {
    if (index <= 0)
      return false;
    const curr = allMessages[index];
    const prev = allMessages[index - 1];
    const currId = curr.isUser ? "__user__" : curr.name;
    const prevId = prev.isUser ? "__user__" : prev.name;
    return currId === prevId;
  }
  function getTypingIndicatorLabel() {
    return typingPlaceholderSpeakerName?.trim() ? `${typingPlaceholderSpeakerName.trim()} is typing…` : "Council is typing…";
  }
  function getVirtualItemCount() {
    return allMessages.length + (typingPlaceholderVisible ? 1 : 0);
  }
  function isTypingPlaceholderIndex(index) {
    return typingPlaceholderVisible && index === allMessages.length;
  }
  function getVirtualItemKey(index) {
    return isTypingPlaceholderIndex(index) ? "__typing__" : allMessages[index]?.messageId || `m:${index}`;
  }
  function getItemTopSpacing(index) {
    if (index <= 0)
      return 0;
    return isTypingPlaceholderIndex(index) ? isTypingPlaceholderGrouped() ? 2 : 12 : isGroupedAt(index) ? 2 : 12;
  }
  function createLocalUserMessageId() {
    localUserMessageCounter += 1;
    return `local-user-${Date.now()}-${localUserMessageCounter}`;
  }
  function createLocalMessageId(prefix) {
    localMessageCounter += 1;
    return `${prefix}-msg-${Date.now()}-${localMessageCounter}`;
  }
  function getVirtualItemSignature(index) {
    if (isTypingPlaceholderIndex(index)) {
      return [
        "typing",
        typingPlaceholderSpeakerName || "",
        isTypingPlaceholderGrouped() ? "grouped" : "solo"
      ].join("|");
    }
    const msg = allMessages[index];
    return [
      msg.messageId,
      msg.name,
      msg.username,
      msg.content,
      msg.avatarUrl || "",
      msg.canRetry ? "retry" : "noretry",
      isGroupedAt(index) ? "grouped" : "solo"
    ].join("|");
  }
  function setTypingPlaceholder(speakerName, visible, shouldScrollToBottom = false) {
    const normalizedSpeaker = speakerName?.trim() ? speakerName.trim() : null;
    const changed = typingPlaceholderVisible !== visible || typingPlaceholderSpeakerName !== normalizedSpeaker;
    typingPlaceholderVisible = visible;
    typingPlaceholderSpeakerName = normalizedSpeaker;
    if (changed) {
      refreshVirtualizer(shouldScrollToBottom, "auto");
    } else if (shouldScrollToBottom) {
      requestBottomScroll("auto");
    }
  }
  function requestBottomScroll(behavior = "auto") {
    if (getVirtualItemCount() === 0)
      return;
    pendingBottomScrollBehavior = behavior;
    if (bottomScrollRaf != null)
      return;
    bottomScrollRaf = requestAnimationFrame(() => {
      bottomScrollRaf = null;
      const nextBehavior = pendingBottomScrollBehavior || "auto";
      pendingBottomScrollBehavior = null;
      ignoreScrollTrackingUntil = performance.now() + 120;
      rowVirtualizer.scrollToIndex(getVirtualItemCount() - 1, {
        align: "end",
        behavior: isGenerating ? "auto" : nextBehavior
      });
    });
  }
  function scheduleVirtualRender() {
    if (virtualRenderRaf != null)
      return;
    virtualRenderRaf = requestAnimationFrame(() => {
      virtualRenderRaf = null;
      renderVirtualItems(rowVirtualizer);
      if (pendingRenderShouldStickToBottom && getVirtualItemCount() > 0) {
        const behavior = pendingBottomScrollBehavior || "auto";
        pendingRenderShouldStickToBottom = false;
        requestBottomScroll(behavior);
      }
    });
  }
  function refreshVirtualizer(shouldScrollToBottom = false, scrollBehavior = "auto") {
    rowVirtualizer.setOptions(buildVirtualizerOptions());
    rowVirtualizer._willUpdate();
    pendingRenderShouldStickToBottom = pendingRenderShouldStickToBottom || shouldScrollToBottom || isStickToBottom;
    if (shouldScrollToBottom) {
      pendingBottomScrollBehavior = scrollBehavior;
    } else if (!pendingBottomScrollBehavior && isStickToBottom) {
      pendingBottomScrollBehavior = "auto";
    }
    scheduleVirtualRender();
  }
  function clearRetryFlags(shouldScrollToBottom = false) {
    let changed = false;
    for (const msg of allMessages) {
      if (msg.canRetry) {
        msg.canRetry = false;
        changed = true;
      }
    }
    if (changed) {
      refreshVirtualizer(shouldScrollToBottom, "auto");
    }
  }
  function setRetryFlag(index) {
    clearRetryFlags(false);
    if (index == null || !allMessages[index]?.isUser)
      return;
    allMessages[index].canRetry = true;
    refreshVirtualizer(false, "auto");
  }
  function isTypingPlaceholderGrouped() {
    if (!typingPlaceholderVisible || !typingPlaceholderSpeakerName || allMessages.length === 0)
      return false;
    const prev = allMessages[allMessages.length - 1];
    return !prev.isUser && prev.name === typingPlaceholderSpeakerName;
  }
  function createTypingPlaceholderElement(index) {
    const isGrouped = isTypingPlaceholderGrouped();
    const speakerName = typingPlaceholderSpeakerName || "Council";
    const row = document.createElement("div");
    row.style.cssText = `
      width:100%;box-sizing:border-box;padding-top:${getItemTopSpacing(index)}px;
    `;
    const wrap = document.createElement("div");
    wrap.className = "chatroom-msg";
    wrap.style.cssText = `
      display:flex;gap:10px;align-items:flex-start;max-width:85%;
      margin-right:auto;
    `;
    const avatarWrap = document.createElement("div");
    avatarWrap.style.cssText = `flex-shrink:0;width:32px;height:32px;${isGrouped ? "visibility:hidden;" : ""}`;
    const initial = speakerName.charAt(0).toUpperCase() || "C";
    avatarWrap.innerHTML = `<div style="width:32px;height:32px;border-radius:50%;background:${memberColor(speakerName)};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;">${initial}</div>`;
    wrap.appendChild(avatarWrap);
    const col = document.createElement("div");
    col.style.cssText = "display:flex;flex-direction:column;gap:2px;min-width:0;align-items:flex-start;";
    if (!isGrouped) {
      const nameEl = document.createElement("div");
      nameEl.style.cssText = "font-size:var(--lcs-chat-name-font-size);font-weight:700;padding:0 6px;";
      nameEl.style.color = memberColor(speakerName);
      nameEl.textContent = speakerName;
      col.appendChild(nameEl);
    }
    const bubble = document.createElement("div");
    bubble.style.cssText = `
      padding:10px 14px;border-radius:18px;border-bottom-left-radius:4px;
      font-size:var(--lcs-chat-message-font-size);line-height:1.45;word-break:break-word;
      background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text-dim);
      display:flex;align-items:center;gap:8px;font-style:italic;
    `;
    bubble.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1.5s linear infinite;flex-shrink:0;">
        <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      <span>${getTypingIndicatorLabel()}</span>
    `;
    col.appendChild(bubble);
    wrap.appendChild(col);
    row.appendChild(wrap);
    return row;
  }
  function createMessageElement(index) {
    const msg = allMessages[index];
    const isGrouped = isGroupedAt(index);
    const isUser = msg.isUser;
    const row = document.createElement("div");
    row.dataset.messageId = msg.messageId;
    row.style.cssText = `
      width:100%;box-sizing:border-box;padding-top:${getItemTopSpacing(index)}px;
    `;
    const wrap = document.createElement("div");
    wrap.className = "chatroom-msg";
    wrap.style.cssText = `
      display:flex;gap:10px;align-items:flex-start;max-width:85%;
      ${isUser ? "margin-left:auto;flex-direction:row-reverse;" : "margin-right:auto;"}
    `;
    if (!animatedMessageIds.has(msg.messageId)) {
      wrap.classList.add("chatroom-msg-entering");
      animatedMessageIds.add(msg.messageId);
    }
    const avatarWrap = document.createElement("div");
    avatarWrap.style.cssText = `flex-shrink:0;width:32px;height:32px;${isGrouped ? "visibility:hidden;" : ""}`;
    if (msg.avatarUrl) {
      avatarWrap.innerHTML = `<img src="${msg.avatarUrl}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`;
    } else {
      const displayName = isUser ? userPersona?.name || "You" : msg.name;
      const initial = displayName.charAt(0).toUpperCase();
      const bg = isUser ? "var(--lumiverse-primary)" : memberColor(msg.name);
      const fg = "white";
      avatarWrap.innerHTML = `<div style="width:32px;height:32px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${fg};">${initial}</div>`;
    }
    wrap.appendChild(avatarWrap);
    const col = document.createElement("div");
    col.style.cssText = `display:flex;flex-direction:column;gap:2px;min-width:0;${isUser ? "align-items:flex-end;" : "align-items:flex-start;"}`;
    if (!isGrouped) {
      const nameEl = document.createElement("div");
      nameEl.style.cssText = "font-size:var(--lcs-chat-name-font-size);font-weight:700;padding:0 6px;";
      nameEl.style.color = isUser ? "var(--lumiverse-primary)" : memberColor(msg.name);
      nameEl.textContent = isUser ? userPersona?.name || "You" : msg.username || msg.name;
      col.appendChild(nameEl);
    }
    const bubble = document.createElement("div");
    bubble.className = "chatroom-rich";
    bubble.style.cssText = `
      padding:10px 14px;border-radius:18px;font-size:var(--lcs-chat-message-font-size);
      line-height:1.45;word-break:break-word;
      ${isUser ? "background:var(--lumiverse-primary);color:white;border-bottom-right-radius:4px;" : "background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);border-bottom-left-radius:4px;"}
    `;
    bubble.innerHTML = formatMessageContent(msg.content);
    col.appendChild(bubble);
    const metaRow = document.createElement("div");
    metaRow.style.cssText = `display:flex;align-items:center;gap:4px;padding:0 6px;${isUser ? "flex-direction:row-reverse;" : ""}`;
    const copyBtn = document.createElement("button");
    makeInteractive(copyBtn);
    copyBtn.className = "chatroom-copy-btn";
    copyBtn.type = "button";
    copyBtn.title = "Copy message";
    copyBtn.setAttribute("aria-label", "Copy message");
    copyBtn.style.cssText = `
      width:20px;height:20px;border:none;border-radius:999px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;padding:0;
      background:transparent;color:${isUser ? "rgba(255,255,255,0.9)" : "var(--lumiverse-text-dim)"};
    `;
    copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    copyBtn.addEventListener("click", async () => {
      const prevLabel = copyBtn.getAttribute("aria-label") || "Copy message";
      try {
        await copyToClipboard(msg.content);
        copyBtn.setAttribute("aria-label", "Copied");
        copyBtn.title = "Copied";
      } catch {
        copyBtn.setAttribute("aria-label", "Copy failed");
        copyBtn.title = "Copy failed";
      }
      window.setTimeout(() => {
        copyBtn.setAttribute("aria-label", prevLabel);
        copyBtn.title = "Copy message";
      }, 1200);
    });
    metaRow.appendChild(copyBtn);
    if (msg.isUser && msg.canRetry) {
      const retryBtn = document.createElement("button");
      makeInteractive(retryBtn);
      retryBtn.type = "button";
      retryBtn.textContent = "Retry";
      retryBtn.title = "Retry council response";
      retryBtn.style.cssText = `
        border:none;background:transparent;cursor:pointer;padding:0 4px;
        font-size:var(--lcs-chat-meta-font-size);font-weight:600;color:${isUser ? "rgba(255,255,255,0.92)" : "var(--lumiverse-primary)"};
        opacity:.82;
      `;
      retryBtn.addEventListener("click", () => {
        if (isGenerating)
          return;
        clearRetryFlags(false);
        pendingUserRetryCandidateIndex = index;
        currentGenerationRetryCandidateIndex = index;
        ctx.sendToBackend({ type: "retry_last_user_message" });
      });
      metaRow.appendChild(retryBtn);
    }
    const timeEl = document.createElement("div");
    timeEl.style.cssText = "font-size:var(--lcs-chat-meta-font-size);color:var(--lumiverse-text-dim);";
    const ts = new Date(msg.timestamp);
    timeEl.textContent = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    metaRow.appendChild(timeEl);
    col.appendChild(metaRow);
    wrap.appendChild(col);
    row.appendChild(wrap);
    return row;
  }
  function buildVirtualizerOptions() {
    return {
      count: getVirtualItemCount(),
      getScrollElement: () => messageList,
      estimateSize: (index) => msgHeightCache.get(getVirtualItemKey(index)) || ESTIMATED_MSG_HEIGHT,
      getItemKey: getVirtualItemKey,
      overscan: VIRTUAL_OVERSCAN,
      paddingStart: VIRTUAL_LIST_PADDING,
      paddingEnd: VIRTUAL_LIST_PADDING,
      observeElementRect,
      observeElementOffset,
      scrollToFn: elementScroll,
      useAnimationFrameWithResizeObserver: true,
      onChange: (instance, sync) => {
        scheduleVirtualRender();
        if (!sync && isStickToBottom && getVirtualItemCount() > 0 && pendingBottomScrollBehavior == null) {
          pendingRenderShouldStickToBottom = true;
          pendingBottomScrollBehavior = "auto";
        }
      }
    };
  }
  const rowVirtualizer = new Virtualizer(buildVirtualizerOptions());
  const destroyVirtualizer = rowVirtualizer._didMount();
  rowVirtualizer.shouldAdjustScrollPositionOnItemSizeChange = (item, _delta, instance) => {
    if (isStickToBottom)
      return false;
    return item.start < (instance.scrollOffset ?? 0);
  };
  rowVirtualizer._willUpdate();
  function renderVirtualItems(instance) {
    const items = instance.getVirtualItems();
    virtualContent.style.height = `${instance.getTotalSize()}px`;
    if (items.length === 0) {
      virtualContent.replaceChildren();
      renderedRows.clear();
      rowVirtualizer.measureElement(null);
      return;
    }
    const desiredRows = [];
    const rows = [];
    const activeKeys = new Set;
    for (const item of items) {
      const key = String(item.key);
      const signature = getVirtualItemSignature(item.index);
      let row = renderedRows.get(key);
      if (!row || row.dataset.vsig !== signature) {
        row = isTypingPlaceholderIndex(item.index) ? createTypingPlaceholderElement(item.index) : createMessageElement(item.index);
        renderedRows.set(key, row);
        rows.push(row);
        dirtyMeasurementKeys.add(key);
      }
      row.setAttribute("data-index", String(item.index));
      row.dataset.vkey = key;
      row.dataset.vsig = signature;
      row.style.position = "absolute";
      row.style.top = "0";
      row.style.left = "0";
      row.style.width = "100%";
      row.style.transform = `translateY(${item.start}px)`;
      desiredRows.push(row);
      activeKeys.add(key);
    }
    for (const [key, row] of renderedRows) {
      if (!activeKeys.has(key)) {
        row.remove();
        renderedRows.delete(key);
      }
    }
    let cursor = virtualContent.firstChild;
    for (const row of desiredRows) {
      if (row !== cursor) {
        virtualContent.insertBefore(row, cursor);
      } else {
        cursor = cursor?.nextSibling || null;
      }
      cursor = row.nextSibling;
    }
    while (cursor) {
      const next = cursor.nextSibling;
      virtualContent.removeChild(cursor);
      cursor = next;
    }
    for (const row of desiredRows) {
      const key = row.dataset.vkey;
      if (!key || !dirtyMeasurementKeys.has(key) && msgHeightCache.has(key))
        continue;
      rowVirtualizer.measureElement(row);
      const index = Number.parseInt(row.getAttribute("data-index") || "-1", 10);
      if (index >= 0) {
        msgHeightCache.set(getVirtualItemKey(index), row.offsetHeight);
        dirtyMeasurementKeys.delete(key);
      }
    }
  }
  messageList.addEventListener("scroll", () => {
    if (performance.now() < ignoreScrollTrackingUntil)
      return;
    isStickToBottom = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight <= 24;
  });
  const controls = document.createElement("div");
  controls.style.cssText = `
    padding:12px 16px;border-top:1px solid var(--lumiverse-border);
    background:var(--lumiverse-bg);display:flex;flex-direction:column;gap:10px;flex-shrink:0;
  `;
  const inputRow = document.createElement("div");
  inputRow.style.cssText = "display:flex;gap:10px;align-items:flex-end;";
  const inputField = document.createElement("textarea");
  makeInteractive(inputField);
  inputField.placeholder = "Type a message…";
  inputField.rows = 1;
  const INPUT_MAX_VISIBLE_LINES = 4;
  inputField.style.cssText = `
    flex:1;padding:10px 14px;border:1px solid var(--lumiverse-border);
    border-radius:18px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);
    font-size:${isMobile ? "var(--lcs-chat-input-font-size-mobile)" : "var(--lcs-chat-input-font-size)"};outline:none;min-width:0;resize:none;
    font-family:inherit;line-height:1.4;min-height:40px;overflow-y:hidden;
  `;
  function resetInputHeight() {
    inputField.style.height = "40px";
    inputField.style.overflowY = "hidden";
  }
  function adjustInputHeight() {
    inputField.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(inputField).lineHeight) || 20;
    const verticalPadding = 20;
    const maxHeight = Math.round(lineHeight * INPUT_MAX_VISIBLE_LINES + verticalPadding);
    const nextHeight = Math.min(inputField.scrollHeight, maxHeight);
    inputField.style.height = `${nextHeight}px`;
    inputField.style.overflowY = inputField.scrollHeight > maxHeight ? "auto" : "hidden";
  }
  resetInputHeight();
  const sendButton = document.createElement("button");
  makeInteractive(sendButton);
  sendButton.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  sendButton.style.cssText = `
    display:flex;align-items:center;justify-content:center;
    width:40px;height:40px;border-radius:50%;background:var(--lumiverse-primary);
    color:white;border:none;cursor:pointer;flex-shrink:0;
    transition:opacity .2s,transform .1s;
  `;
  sendButton.addEventListener("mouseenter", () => sendButton.style.opacity = "0.85");
  sendButton.addEventListener("mouseleave", () => sendButton.style.opacity = "1");
  inputRow.appendChild(inputField);
  inputRow.appendChild(sendButton);
  controls.appendChild(inputRow);
  const toolsRow = document.createElement("div");
  toolsRow.style.cssText = "display:flex;justify-content:space-between;align-items:center;";
  const autoToggleLabel = document.createElement("label");
  autoToggleLabel.style.cssText = "display:flex;gap:8px;font-size:13px;color:var(--lumiverse-text-dim);align-items:center;cursor:pointer;user-select:none;";
  const autoToggle = document.createElement("input");
  autoToggle.type = "checkbox";
  autoToggle.style.cssText = "width:16px;height:16px;cursor:pointer;accent-color:var(--lumiverse-primary);";
  autoToggleLabel.appendChild(autoToggle);
  autoToggleLabel.appendChild(document.createTextNode("Auto-reply"));
  const genButton = document.createElement("button");
  makeInteractive(genButton);
  genButton.textContent = "Generate";
  genButton.style.cssText = `
    padding:6px 14px;border-radius:var(--lumiverse-radius,6px);
    background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);
    border:1px solid var(--lumiverse-border);font-size:12px;font-weight:500;
    cursor:pointer;transition:all .15s;
  `;
  genButton.addEventListener("mouseenter", () => genButton.style.background = "var(--lumiverse-fill-hover)");
  genButton.addEventListener("mouseleave", () => genButton.style.background = "var(--lumiverse-fill-subtle)");
  header.dataset.chatroomRegion = "header";
  body.dataset.chatroomRegion = "body";
  controls.dataset.chatroomRegion = "controls";
  inputField.dataset.chatroomRegion = "input";
  genButton.dataset.chatroomRegion = "action";
  function applyWidgetTheme() {
    const glassEnabled = document.documentElement.hasAttribute("data-glass");
    shell.style.background = glassEnabled ? "color-mix(in srgb, var(--lcs-glass-bg, var(--lumiverse-bg)) 88%, transparent)" : "var(--lumiverse-bg)";
    shell.style.border = glassEnabled ? "1px solid var(--lcs-glass-border, var(--lumiverse-border))" : "1px solid var(--lumiverse-border)";
    shell.style.boxShadow = glassEnabled ? "0 18px 48px rgba(0,0,0,0.22), 0 4px 14px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)" : "0 20px 60px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)";
    shell.style.backdropFilter = glassEnabled ? "blur(6px) saturate(1.03)" : "none";
    shell.style.webkitBackdropFilter = glassEnabled ? "blur(6px) saturate(1.03)" : "none";
    header.style.background = glassEnabled ? "linear-gradient(180deg, color-mix(in srgb, var(--lcs-glass-bg, var(--lumiverse-fill-subtle)) 78%, transparent) 0%, color-mix(in srgb, var(--lumiverse-fill, var(--lumiverse-bg-elevated)) 72%, transparent) 100%)" : "linear-gradient(180deg, var(--lumiverse-fill-subtle) 0%, var(--lumiverse-fill) 100%)";
    header.style.borderBottomColor = glassEnabled ? "var(--lcs-glass-border, var(--lumiverse-border))" : "var(--lumiverse-border)";
    body.style.background = glassEnabled ? "color-mix(in srgb, var(--lumiverse-bg) 90%, transparent)" : "transparent";
    controls.style.background = glassEnabled ? "color-mix(in srgb, var(--lumiverse-bg) 84%, transparent)" : "var(--lumiverse-bg)";
    controls.style.borderTopColor = glassEnabled ? "var(--lcs-glass-border, var(--lumiverse-border))" : "var(--lumiverse-border)";
    inputField.style.background = glassEnabled ? "color-mix(in srgb, var(--lumiverse-fill-subtle) 82%, var(--lcs-glass-bg, transparent) 18%)" : "var(--lumiverse-fill-subtle)";
    inputField.style.borderColor = glassEnabled ? "var(--lcs-glass-border, var(--lumiverse-border))" : "var(--lumiverse-border)";
    genButton.style.background = glassEnabled ? "color-mix(in srgb, var(--lumiverse-fill-subtle) 84%, var(--lcs-glass-bg, transparent) 16%)" : "var(--lumiverse-fill-subtle)";
    genButton.style.borderColor = glassEnabled ? "var(--lcs-glass-border, var(--lumiverse-border))" : "var(--lumiverse-border)";
  }
  let themeSyncRaf = null;
  function syncWidgetVisualPreferences() {
    if (themeSyncRaf != null)
      return;
    themeSyncRaf = requestAnimationFrame(() => {
      themeSyncRaf = null;
      applyWidgetTheme();
      if (applyWidgetPreferenceVars()) {
        invalidateVirtualMeasurements(false);
      }
    });
  }
  syncWidgetVisualPreferences();
  const rootThemeObserver = new MutationObserver(() => syncWidgetVisualPreferences());
  rootThemeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-glass", "data-theme-mode", "style", "class"]
  });
  toolsRow.appendChild(autoToggleLabel);
  toolsRow.appendChild(genButton);
  controls.appendChild(toolsRow);
  body.appendChild(controls);
  widget.root.appendChild(body);
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "chatroom-resize";
  resizeHandle.style.cssText = `
    position:absolute;right:0;bottom:0;width:20px;height:20px;
    cursor:nwse-resize;z-index:10;
    display:${isMobile ? "none" : "flex"};
    align-items:flex-end;justify-content:flex-end;
    padding:0 4px 4px 0;
    touch-action:none;
  `;
  resizeHandle.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.3;"><polyline points="22 12 22 22 12 22"/></svg>`;
  widget.root.appendChild(resizeHandle);
  let isResizing = false;
  let resizeStart = { x: 0, y: 0, w: 0, h: 0 };
  let resizeAnchor = { x: 0, y: 0 };
  let rafId = null;
  const WIDGET_MIN_W = isMobile ? 260 : 320;
  const WIDGET_MIN_H = isMobile ? 120 : 180;
  const WIDGET_MAX_W = Math.min(900, window.innerWidth - (isMobile ? 8 : 32));
  const WIDGET_MAX_H = Math.min(1000, window.innerHeight - (isMobile ? 32 : 64));
  function startResize(clientX, clientY) {
    const pos = widget.getPosition();
    resizeAnchor = { x: pos.x, y: pos.y };
    resizeStart = { x: clientX, y: clientY, w: shell.offsetWidth, h: shell.offsetHeight };
    isResizing = true;
    document.body.style.cursor = "nwse-resize";
  }
  function onResizePointerMove(e) {
    if (!isResizing)
      return;
    const nw = Math.max(WIDGET_MIN_W, Math.min(WIDGET_MAX_W, resizeStart.w + (e.clientX - resizeStart.x)));
    const nh = Math.max(WIDGET_MIN_H, Math.min(WIDGET_MAX_H, resizeStart.h + (e.clientY - resizeStart.y)));
    shell.style.setProperty("width", nw + "px", "important");
    shell.style.setProperty("height", nh + "px", "important");
    if (isCollapsed) {
      isCollapsed = false;
      updateCollapse();
    }
    if (rafId)
      cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      widget.moveTo(resizeAnchor.x, resizeAnchor.y);
      rafId = null;
    });
  }
  function onResizePointerUp(e) {
    if (!isResizing)
      return;
    isResizing = false;
    document.body.style.cursor = "";
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    try {
      resizeHandle.releasePointerCapture(e.pointerId);
    } catch (_) {}
    sizedWidget.setSize?.(shell.offsetWidth, shell.offsetHeight);
    syncHostWrapperSize();
    persistWidgetState();
  }
  function onWindowPointerDown(e) {
    const target = e.target;
    if (!target?.closest?.(".chatroom-resize"))
      return;
    e.stopPropagation();
    startResize(e.clientX, e.clientY);
    resizeHandle.setPointerCapture(e.pointerId);
  }
  window.addEventListener("pointerdown", onWindowPointerDown, true);
  resizeHandle.addEventListener("pointermove", onResizePointerMove);
  resizeHandle.addEventListener("pointerup", onResizePointerUp);
  resizeHandle.addEventListener("pointercancel", onResizePointerUp);
  function syncHostWrapperSize() {
    if (syncFullscreenStateFromHost())
      return;
    const w = Math.round(shell.getBoundingClientRect().width);
    const h = Math.round(shell.getBoundingClientRect().height);
    const hostW = Math.round(hostWrapper.getBoundingClientRect().width);
    const hostH = Math.round(hostWrapper.getBoundingClientRect().height);
    if (w > 0 && hostW !== w)
      hostWrapper.style.setProperty("width", w + "px", "important");
    if (h > 0 && hostH !== h)
      hostWrapper.style.setProperty("height", h + "px", "important");
  }
  function updateCollapse() {
    if (isCollapsed) {
      body.style.pointerEvents = "none";
      body.style.opacity = "0";
      body.style.transform = "translateY(-10px) scale(0.985)";
      collapseBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
      collapseBtn.title = "Expand";
      setWidgetSize(shell.offsetWidth, header.offsetHeight);
      syncHostWrapperSize();
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
        badge.style.display = "block";
      }
    } else {
      body.style.pointerEvents = "auto";
      body.style.opacity = "1";
      body.style.transform = "translateY(0) scale(1)";
      collapseBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
      collapseBtn.title = "Collapse";
      if (!isFullscreen)
        setWidgetSize(shell.offsetWidth, expandedHeight);
      syncHostWrapperSize();
      badge.style.display = "none";
      unreadCount = 0;
    }
    requestAnimationFrame(() => clampWidgetToViewport());
  }
  collapseBtn.addEventListener("click", () => {
    if (syncFullscreenStateFromHost()) {
      fsBtn.click();
    }
    if (!isCollapsed)
      expandedHeight = shell.offsetHeight;
    isCollapsed = !isCollapsed;
    updateCollapse();
    persistWidgetState();
  });
  const supportsNativeFullscreen = typeof widget.setFullscreen === "function";
  fsBtn.addEventListener("click", () => {
    syncFullscreenStateFromHost();
    if (isFullscreen) {
      isFullscreen = false;
      if (supportsNativeFullscreen) {
        widget.setFullscreen(false);
      } else {
        const props = ["position", "left", "top", "right", "bottom", "margin", "transform"];
        props.forEach((p) => hostWrapper.style.removeProperty(p));
        if (preFullscreenState) {
          widget.moveTo(preFullscreenState.x, preFullscreenState.y);
        }
      }
      if (preFullscreenState) {
        setWidgetSize(preFullscreenState.w, preFullscreenState.h);
      }
      shell.style.removeProperty("border-radius");
      syncHeaderSafeAreaPadding();
      updateCollapse();
      fsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
      fsBtn.title = "Fullscreen";
    } else {
      preFullscreenState = { w: shell.offsetWidth, h: shell.offsetHeight, x: widget.getPosition().x, y: widget.getPosition().y };
      isFullscreen = true;
      isCollapsed = false;
      persistCollapsedState();
      if (supportsNativeFullscreen) {
        widget.setFullscreen(true);
      } else {
        widget.moveTo(0, 0);
        hostWrapper.style.setProperty("position", "fixed", "important");
        hostWrapper.style.setProperty("left", "0", "important");
        hostWrapper.style.setProperty("top", "0", "important");
        hostWrapper.style.setProperty("right", "auto", "important");
        hostWrapper.style.setProperty("bottom", "auto", "important");
        hostWrapper.style.setProperty("width", "100vw", "important");
        hostWrapper.style.setProperty("height", "100vh", "important");
        hostWrapper.style.setProperty("margin", "0", "important");
        hostWrapper.style.setProperty("transform", "none", "important");
      }
      shell.style.setProperty("width", "100%", "important");
      shell.style.setProperty("height", "100%", "important");
      shell.style.setProperty("border-radius", "0", "important");
      syncHeaderSafeAreaPadding();
      updateCollapse();
      fsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`;
      fsBtn.title = "Exit Fullscreen";
    }
  });
  hideBtn.addEventListener("click", () => setWidgetVisible(false));
  window.addEventListener("resize", () => {
    syncHeaderSafeAreaPadding();
    if (isFullscreen && !supportsNativeFullscreen) {
      shell.style.setProperty("width", window.innerWidth + "px", "important");
      shell.style.setProperty("height", window.innerHeight + "px", "important");
      return;
    }
    if (isFullscreen)
      return;
    const pos = widget.getPosition();
    const rect = shell.getBoundingClientRect();
    let { x: nx, y: ny } = pos;
    const pad = 8;
    if (nx < pad)
      nx = pad;
    if (nx + rect.width > window.innerWidth - pad)
      nx = Math.max(pad, window.innerWidth - rect.width - pad);
    if (ny < pad)
      ny = pad;
    if (ny + rect.height > window.innerHeight - pad)
      ny = Math.max(pad, window.innerHeight - rect.height - pad);
    if (nx !== pos.x || ny !== pos.y)
      widget.moveTo(nx, ny);
  });
  autoToggle.addEventListener("change", () => {
    ctx.sendToBackend({ type: "set_auto_reply", enabled: autoToggle.checked });
    if (triggerMode === "time") {
      if (autoToggle.checked) {
        startAutoTimer();
      } else {
        stopAutoTimer();
      }
    }
  });
  const sendMessage = () => {
    if (isGenerating)
      return;
    const text = inputField.value.trim();
    if (!text)
      return;
    const clientMessageId = createLocalUserMessageId();
    inputField.value = "";
    inputField.rows = 1;
    resetInputHeight();
    appendMessage(userPersona?.name || "You", userPersona?.name || "You", text, userPersona?.avatarUrl || null, true, clientMessageId);
    ctx.sendToBackend({ type: "user_message", content: text, clientMessageId });
  };
  sendButton.addEventListener("click", sendMessage);
  inputField.addEventListener("input", adjustInputHeight);
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  genButton.addEventListener("click", () => {
    if (isGenerating)
      return;
    ctx.sendToBackend({ type: "trigger_generation" });
  });
  function appendMessage(name, username, content, avatarUrl, isUser = false, clientMessageId, messageId, shouldAnimate = true) {
    if (!isUser && typingPlaceholderVisible) {
      setTypingPlaceholder(null, false, false);
    }
    const nextMessageId = messageId || createLocalMessageId(isUser ? "user" : name === "System" ? "system" : "assistant");
    if (!shouldAnimate) {
      animatedMessageIds.add(nextMessageId);
    }
    allMessages.push({
      messageId: nextMessageId,
      name,
      username,
      content,
      avatarUrl,
      isUser,
      timestamp: Date.now(),
      canRetry: false,
      clientMessageId
    });
    lastSenderId = isUser ? "__user__" : name;
    if (isUser) {
      pendingUserRetryCandidateIndex = allMessages.length - 1;
    } else {
      pendingUserRetryCandidateIndex = null;
      clearRetryFlags(false);
    }
    if (isUser) {
      isStickToBottom = true;
    }
    const shouldScroll = isUser || isStickToBottom;
    refreshVirtualizer(shouldScroll, isUser ? "smooth" : "auto");
    if (isCollapsed) {
      unreadCount++;
      badge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
      badge.style.display = "block";
    }
  }
  function reconcileUserMessage(clientMessageId, name, username, content, avatarUrl) {
    const index = allMessages.findIndex((msg2) => msg2.isUser && msg2.clientMessageId === clientMessageId);
    if (index === -1) {
      appendMessage(name, username, content, avatarUrl, true, clientMessageId);
      return;
    }
    const msg = allMessages[index];
    const changed = msg.name !== name || msg.username !== username || msg.content !== content || msg.avatarUrl !== avatarUrl;
    msg.name = name;
    msg.username = username;
    msg.content = content;
    msg.avatarUrl = avatarUrl;
    msg.clientMessageId = clientMessageId;
    if (changed) {
      refreshVirtualizer(index === allMessages.length - 1 && isStickToBottom, "auto");
    }
  }
  function clearMessages() {
    allMessages = [];
    msgHeightCache.clear();
    animatedMessageIds.clear();
    renderedRows.clear();
    lastSenderId = null;
    unreadCount = 0;
    pendingUserRetryCandidateIndex = null;
    currentGenerationRetryCandidateIndex = null;
    typingPlaceholderVisible = false;
    typingPlaceholderSpeakerName = null;
    refreshVirtualizer(false, "auto");
  }
  function loadHistory(history) {
    allMessages = [];
    msgHeightCache.clear();
    animatedMessageIds.clear();
    renderedRows.clear();
    for (const msg of history) {
      const messageId = createLocalMessageId(msg.isUser ? "user" : "assistant");
      animatedMessageIds.add(messageId);
      allMessages.push({
        messageId,
        name: msg.name,
        username: msg.username,
        content: msg.content,
        avatarUrl: msg.avatarUrl,
        isUser: msg.isUser,
        timestamp: msg.timestamp || Date.now(),
        canRetry: false,
        clientMessageId: undefined
      });
    }
    lastSenderId = allMessages.length > 0 ? allMessages[allMessages.length - 1].isUser ? "__user__" : allMessages[allMessages.length - 1].name : null;
    pendingUserRetryCandidateIndex = allMessages.length > 0 && allMessages[allMessages.length - 1].isUser ? allMessages.length - 1 : null;
    currentGenerationRetryCandidateIndex = null;
    typingPlaceholderVisible = false;
    typingPlaceholderSpeakerName = null;
    isStickToBottom = true;
    refreshVirtualizer(true, "auto");
  }
  const unsubBackend = ctx.onBackendMessage((payload) => {
    if (payload.type === "settings_loaded") {
      triggerModeSelect.value = payload.triggerMode ?? "time";
      messageIntervalInput.value = (payload.messageInterval ?? 10).toString();
      randomToggleCheckbox.checked = payload.randomIntervalEnabled ?? true;
      intervalMinInput.value = (payload.intervalMin ?? 5).toString();
      intervalMaxInput.value = (payload.intervalMax ?? 15).toString();
      messageCountInput.value = (payload.messageCount ?? 5).toString();
      randomMessageCountCheckbox.checked = payload.randomMessageCountEnabled ?? true;
      messageCountMinInput.value = (payload.messageCountMin ?? 3).toString();
      messageCountMaxInput.value = (payload.messageCountMax ?? 7).toString();
      contextInput.value = (payload.contextLimit ?? 10).toString();
      maxContextTokensInput.value = (payload.maxContextTokens ?? 4096).toString();
      temperatureInput.value = payload.temperature != null ? payload.temperature.toString() : "";
      topPInput.value = payload.topP != null ? payload.topP.toString() : "";
      topKEnabledCheckbox.checked = payload.topKEnabled ?? false;
      topKInput.value = (payload.topK ?? 0).toString();
      maxResponseTokensInput.value = payload.maxResponseTokens != null ? payload.maxResponseTokens.toString() : "";
      triggerMode = payload.triggerMode ?? "time";
      messageInterval = payload.messageInterval ?? 10;
      randomIntervalEnabled = payload.randomIntervalEnabled ?? true;
      intervalMin = payload.intervalMin ?? 5;
      intervalMax = payload.intervalMax ?? 15;
      messageCount = payload.messageCount ?? 5;
      randomMessageCountEnabled = payload.randomMessageCountEnabled ?? true;
      messageCountMin = payload.messageCountMin ?? 3;
      messageCountMax = payload.messageCountMax ?? 7;
      updateTriggerMode();
      updateTimeRangeVisibility();
      updateMessageCountRangeVisibility();
      updateTopKVisibility();
      if (payload.userPersona) {
        userPersona = payload.userPersona;
      }
      chatroomNameInput.value = payload.chatroomName ?? "";
      headerTitle.textContent = payload.chatroomName?.trim() || "Council Chatroom";
      autoToggle.checked = payload.autoReply ?? false;
      if (payload.autoReply && triggerMode === "time") {
        startAutoTimer();
      } else if (!payload.autoReply && autoTimer) {
        stopAutoTimer();
      }
      connectionSelect.innerHTML = '<option value="">Default Active Connection</option>';
      if (payload.connections) {
        for (const conn of payload.connections) {
          const opt = document.createElement("option");
          opt.value = conn.id;
          opt.textContent = `${conn.name} (${conn.provider})`;
          connectionSelect.appendChild(opt);
        }
      }
      connectionSelect.value = payload.connectionId || "";
      const shouldShowWidget = Boolean(payload.history && payload.history.length > 0 || payload.hasActiveChat);
      if (payload.history && payload.history.length > 0) {
        loadHistory(payload.history);
      } else if (payload.hasActiveChat) {
        clearMessages();
      } else {
        clearMessages();
      }
      if (!isMobile && payload.widgetX != null && payload.widgetY != null) {
        widget.moveTo(payload.widgetX, payload.widgetY);
      }
      if (!isMobile && payload.widgetW != null && payload.widgetH != null) {
        setWidgetSize(payload.widgetW, payload.widgetH);
        expandedHeight = payload.widgetH;
        syncHostWrapperSize();
      }
      isCollapsed = payload.widgetCollapsed ?? false;
      updateCollapse();
      setWidgetVisible(shouldShowWidget);
    } else if (payload.type === "hide_widget") {
      setWidgetVisible(false);
      stopAutoTimer();
      autoToggle.checked = false;
    } else if (payload.type === "chat_changed") {
      setWidgetVisible(true);
      headerTitle.textContent = payload.chatroomName?.trim() || "Council Chatroom";
      if (payload.history && payload.history.length > 0) {
        loadHistory(payload.history);
      } else {
        clearMessages();
      }
    } else if (payload.type === "generation_started") {
      isGenerating = true;
      genButton.disabled = true;
      genButton.style.opacity = "0.5";
      clearRetryFlags(false);
      currentGenerationRetryCandidateIndex = pendingUserRetryCandidateIndex;
      setTypingPlaceholder(null, true, true);
    } else if (payload.type === "typing_status") {
      setTypingPlaceholder(payload.speakerName || null, Boolean(payload.speakerName), isStickToBottom);
    } else if (payload.type === "generation_ended") {
      isGenerating = false;
      genButton.disabled = false;
      genButton.style.opacity = "1";
      setTypingPlaceholder(null, false, false);
      const retryIndex = currentGenerationRetryCandidateIndex ?? pendingUserRetryCandidateIndex;
      if (payload.failed && (payload.responseCount ?? 0) === 0 && retryIndex != null) {
        setRetryFlag(retryIndex);
      } else {
        clearRetryFlags(false);
      }
      currentGenerationRetryCandidateIndex = null;
    } else if (payload.type === "new_message") {
      if (payload.isUser && payload.clientMessageId) {
        reconcileUserMessage(payload.clientMessageId, payload.name, payload.username || payload.name, payload.content, payload.avatarUrl);
      } else {
        appendMessage(payload.name, payload.username || payload.name, payload.content, payload.avatarUrl, payload.isUser);
      }
    } else if (payload.type === "error") {
      appendMessage("System", "System", `Error: ${payload.message}`, null);
    }
  });
  ctx.sendToBackend({ type: "load_settings" });
  return () => {
    if (autoTimer)
      clearTimeout(autoTimer);
    if (widgetVisibilityTimer != null)
      window.clearTimeout(widgetVisibilityTimer);
    if (themeSyncRaf != null)
      cancelAnimationFrame(themeSyncRaf);
    window.removeEventListener("pointerdown", onWindowPointerDown, true);
    window.removeEventListener("popstate", syncRouteVisibility);
    window.removeEventListener("hashchange", syncRouteVisibility);
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    rootThemeObserver.disconnect();
    shellResizeObserver.disconnect();
    destroyVirtualizer();
    unsubBackend();
    widget.destroy();
    tab.destroy();
    ctx.dom.cleanup();
  };
}
export {
  setup
};
