// O(log n) binary search to find the latest non-conflicting event.
const binarySearchForLatestNonConflict = (events, i) => {
  let low = 0;
  let high = i - 1;
  let result = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (events[mid].end <= events[i].start) {
      result = mid; // This is a potential candidate
      low = mid + 1; // Try to find a later one
    } else {
      high = mid - 1;
    }
  }
  return result;
};

// --- ALGORITHM #1: BOTTOM-UP DP (ITERATIVE) ---
const runDP_BottomUp = (events) => {
  if (!events || events.length === 0) return { schedule: [], totalWeight: 0, table: [] };
  const n = events.length;
  const dpTable = Array(n).fill(null);
  dpTable[0] = { weight: events[0].weight, events: [events[0]] };

  for (let i = 1; i < n; i++) {
    const currentEvent = events[i];
    let inclWeight = currentEvent.weight;
    const latestNonConflictIndex = binarySearchForLatestNonConflict(events, i);
    let inclEvents = [currentEvent];
    if (latestNonConflictIndex !== -1) {
      inclWeight += dpTable[latestNonConflictIndex].weight;
      inclEvents = [...inclEvents, ...dpTable[latestNonConflictIndex].events];
    }
    const exclWeight = dpTable[i - 1].weight;
    if (inclWeight > exclWeight) {
      dpTable[i] = { weight: inclWeight, events: inclEvents };
    } else {
      dpTable[i] = { weight: exclWeight, events: dpTable[i - 1].events };
    }
  }
  const finalResult = dpTable[n - 1];
  return { schedule: finalResult.events, totalWeight: finalResult.weight, table: dpTable };
};

// --- ALGORITHM #2: TOP-DOWN DP (RECURSIVE WITH MEMOIZATION) ---
const runDP_TopDown_Recursive = (events, i, memo) => {
  if (i < 0) return { weight: 0, events: [] };
  if (memo[i]) return memo[i];

  const currentEvent = events[i];
  const latestNonConflictIndex = binarySearchForLatestNonConflict(events, i);

  const inclResult = runDP_TopDown_Recursive(events, latestNonConflictIndex, memo);
  const inclWeight = currentEvent.weight + inclResult.weight;
  
  const exclResult = runDP_TopDown_Recursive(events, i - 1, memo);
  const exclWeight = exclResult.weight;

  if (inclWeight > exclWeight) {
    memo[i] = { weight: inclWeight, events: [...inclResult.events, currentEvent] };
  } else {
    memo[i] = exclResult;
  }
  return memo[i];
};

const runDP_TopDown = (events) => {
  if (!events || events.length === 0) return { schedule: [], totalWeight: 0 };
  const memo = Array(events.length).fill(null);
  const result = runDP_TopDown_Recursive(events, events.length - 1, memo);
  return { schedule: result.events, totalWeight: result.weight };
};

// --- ALGORITHM #3: GREEDY ---
const runGreedy = (events) => {
  if (!events || events.length === 0) return { schedule: [], totalWeight: 0 };
  const schedule = [events[0]];
  let lastEndTime = events[0].end;
  let totalWeight = events[0].weight;
  for (let i = 1; i < events.length; i++) {
    if (events[i].start >= lastEndTime) {
      schedule.push(events[i]);
      lastEndTime = events[i].end;
      totalWeight += events[i].weight;
    }
  }
  return { schedule, totalWeight };
};

// --- DEPENDENCY HANDLING: TOPOLOGICAL SORT (KAHN'S ALGORITHM) ---
const topologicalSort = (events) => {
  const inDegree = new Map();
  const adjList = new Map();
  const idMap = new Map(events.map(e => [e.id, e]));

  for (const event of events) {
    inDegree.set(event.id, 0);
    adjList.set(event.id, []);
  }

  for (const event of events) {
    if (event.prerequisite && idMap.has(event.prerequisite)) {
      adjList.get(event.prerequisite).push(event.id);
      inDegree.set(event.id, inDegree.get(event.id) + 1);
    }
  }

  const queue = events.filter(e => inDegree.get(e.id) === 0);
  const sorted = [];
  while (queue.length > 0) {
    // Dequeue a vertex and add it to the sorted list
    const currentVertex = queue.shift();
    sorted.push(currentVertex);
    
    // Decrease in-degree of all adjacent vertices
    for (const neighborId of adjList.get(currentVertex.id)) {
      inDegree.set(neighborId, inDegree.get(neighborId) - 1);
      if (inDegree.get(neighborId) === 0) {
        queue.push(idMap.get(neighborId));
      }
    }
  }

  if (sorted.length !== events.length) {
    throw new Error("Cycle detected in dependencies. Cannot create a valid schedule.");
  }
  return sorted;
};

// --- MAIN COMPUTE FUNCTION ---
export const computeSchedules = (events) => {
  const eventsByResource = events.reduce((acc, event) => {
    const resource = event.resource || 'default';
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(event);
    return acc;
  }, {});

  const results = {
    dpBottomUp: { events: [], totalWeight: 0 },
    dpTopDown: { events: [], totalWeight: 0 },
    greedy: { events: [], totalWeight: 0 },
    dpTables: {},
    error: null,
  };

  try {
    for (const resource in eventsByResource) {
      const resourceEvents = eventsByResource[resource];
      const sortedByDependency = topologicalSort(resourceEvents);
      // Algorithms require sorting by end time after dependency resolution
      const sortedByEndTime = [...sortedByDependency].sort((a, b) => a.end - b.end);

      const buResult = runDP_BottomUp(sortedByEndTime);
      results.dpBottomUp.events.push(...buResult.schedule);
      results.dpBottomUp.totalWeight += buResult.totalWeight;
      results.dpTables[resource] = buResult.table;
      
      const tdResult = runDP_TopDown(sortedByEndTime);
      results.dpTopDown.events.push(...tdResult.schedule);
      results.dpTopDown.totalWeight += tdResult.totalWeight;
      
      const greedyResult = runGreedy(sortedByEndTime);
      results.greedy.events.push(...greedyResult.schedule);
      results.greedy.totalWeight += greedyResult.totalWeight;
    }
  } catch (error) {
    results.error = error.message;
  }
  
  // Sort final combined schedules by start time for a clean display
  results.dpBottomUp.events.sort((a, b) => a.start - b.start);
  results.dpTopDown.events.sort((a, b) => a.start - b.start);
  results.greedy.events.sort((a, b) => a.start - b.start);

  return results;
};