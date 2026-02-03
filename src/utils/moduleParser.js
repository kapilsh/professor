// Parse PyTorch module hierarchy from trace events

export const parseModules = (events) => {
  const moduleMap = {};

  events.forEach(event => {
    if (event.ph !== 'X' || !event.args) return;

    // Look for module information in event args
    const moduleName = event.args.module || event.args['Module Hierarchy'] || event.args.module_name;

    if (moduleName) {
      if (!moduleMap[moduleName]) {
        moduleMap[moduleName] = {
          name: moduleName,
          type: event.args.module_type || 'Unknown',
          occurrences: 0,
          operatorCount: 0,
          hostDuration: 0,
          deviceDuration: 0,
          children: [],
          operators: [],
        };
      }

      moduleMap[moduleName].occurrences++;
      moduleMap[moduleName].operatorCount++;
      moduleMap[moduleName].hostDuration += event.dur;

      if (event.cat && (event.cat.includes('gpu') || event.cat.includes('kernel'))) {
        moduleMap[moduleName].deviceDuration += event.dur;
      }

      moduleMap[moduleName].operators.push({
        name: event.name,
        duration: event.dur,
        timestamp: event.ts,
      });
    }
  });

  // Build hierarchy from module names (e.g., "model.encoder.layer1" -> tree structure)
  const moduleArray = Object.values(moduleMap);

  moduleArray.forEach(module => {
    const parts = module.name.split('.');

    if (parts.length > 1) {
      const parentName = parts.slice(0, -1).join('.');
      const parent = moduleMap[parentName];

      if (parent && !parent.children.includes(module.name)) {
        parent.children.push(module.name);
      }
    }
  });

  return moduleArray.sort((a, b) => b.deviceDuration - a.deviceDuration);
};

// Build tree structure for visualization
export const buildModuleTree = (modules) => {
  const moduleMap = {};

  modules.forEach(module => {
    moduleMap[module.name] = { ...module, children: [] };
  });

  const roots = [];

  modules.forEach(module => {
    const parts = module.name.split('.');

    if (parts.length === 1) {
      roots.push(moduleMap[module.name]);
    } else {
      const parentName = parts.slice(0, -1).join('.');
      const parent = moduleMap[parentName];

      if (parent) {
        parent.children.push(moduleMap[module.name]);
      } else {
        roots.push(moduleMap[module.name]);
      }
    }
  });

  return roots;
};
