exports.getRoleFilter = (user) => {
    const filter = {};
    if (!user || !user.role) return filter;

    switch (user.role) {
        case 'Admin':
            break;
        case 'Halqa Admin':
        case 'Auditor':
            if (user.halquaId) filter.halquaId = parseInt(user.halquaId);
            break;
        case 'Accountant':
        case 'Amir e Muqami':
        case 'Circle Cashier':
            if (user.unitId) filter.unitId = parseInt(user.unitId);
            break;
    }
    return filter;
};

exports.getHalquaFilter = (user) => {
    const filter = {};
    if (!user || !user.role) return filter;

    switch (user.role) {
        case 'Admin':
            break;
        case 'Halqa Admin':
        case 'Auditor':
            if (user.halquaId) filter._id = parseInt(user.halquaId);
            break;
        case 'Accountant':
        case 'Circle Cashier':
            if (user.halquaId) filter._id = parseInt(user.halquaId);
            break;
    }
    return filter;
};
