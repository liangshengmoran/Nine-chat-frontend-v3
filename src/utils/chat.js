export const compilerOnlineUser = userList => {
	const keys = Object.keys(userList);
	if (!keys.length) return [];
	let userInfo = Object.values(userList);
	let homeowner = null;
	const homeownerIndex = userInfo.findIndex(k => k.role === 'admin');
	homeownerIndex !== -1 && (homeowner = userInfo.splice(homeownerIndex, 1));
	homeownerIndex !== -1 && (userInfo = [...homeowner, ...userInfo]);
	return userInfo;
};
