const emotionCategories = [];
const emotionMap = {};
const emotionImages = {};

function loadEmotionData() {
	try {
		const dataModules = import.meta.glob('@/components/Emotion/emotionData/*.json', { eager: true });
		Object.keys(dataModules).forEach(key => {
			const categoryData = dataModules[key].default || dataModules[key];
			const imgDir = categoryData.imgDir || categoryData.category;
			emotionCategories.push({
				category: categoryData.category,
				imgDir,
				emotions: categoryData.emotions,
			});
			categoryData.emotions.forEach(item => {
				const fullKey = `${categoryData.category}:${item.text}`;
				emotionMap[fullKey] = { id: item.id, imgDir };
				if (!emotionMap[item.text]) {
					emotionMap[item.text] = { id: item.id, imgDir };
				}
			});
		});
	} catch (_error) {
		// emotion data load failed silently
	}
}

function loadEmotionImages() {
	try {
		const emotionContext = import.meta.glob('@/components/Emotion/emotionImgs/**/*.{gif,png,jpg,jpeg,webp}', { eager: true });
		Object.keys(emotionContext).forEach(key => {
			const parts = key.split('/');
			const emotionImgsIndex = parts.findIndex(p => p === 'emotionImgs');
			if (emotionImgsIndex === -1 || parts.length < emotionImgsIndex + 3) return;
			const dirName = parts[emotionImgsIndex + 1];
			const filename = parts[parts.length - 1];
			const match = filename.match(/(\d+)\.(gif|png|jpg|jpeg|webp)$/i);
			if (match) {
				const id = match[1];
				if (!emotionImages[dirName]) emotionImages[dirName] = {};
				const mod = emotionContext[key];
				emotionImages[dirName][id] = mod.default || mod;
			}
		});
	} catch (_error) {
		// emotion images load failed silently
	}
}

loadEmotionData();
loadEmotionImages();

export function getImgUrl(id, imgDir) {
	if (imgDir && emotionImages[imgDir] && emotionImages[imgDir][id]) {
		return emotionImages[imgDir][id];
	}
	for (const dir of Object.keys(emotionImages)) {
		if (emotionImages[dir][id]) return emotionImages[dir][id];
	}
	return null;
}

export function emotion(res) {
	const word = res.replace(/\[|\]/gi, '');
	let mapping = emotionMap[word];
	if (!mapping) {
		for (const category of emotionCategories) {
			const found = category.emotions.find(item => item.text === word);
			if (found) {
				mapping = { id: found.id, imgDir: category.imgDir };
				break;
			}
		}
	}
	if (mapping) {
		const url = getImgUrl(mapping.id, mapping.imgDir);
		if (url) {
			return `<img class="emoji-img" width="24" height="24" src="${url}" alt="[${word}]" title="${word}" />`;
		}
	}
	return res;
}

export function replaceEmotionText(content) {
	if (!content || typeof content !== 'string') return '';
	return content.replace(/\[[^\[\]]{1,30}\]/g, emotion);
}

export function parseMixedContent(content) {
	if (!content || typeof content !== 'string') return '';
	const regex = /(\[[^\[\]]{1,30}\])/g;
	const parts = content.split(regex);
	return parts.map(part => {
		if (part.startsWith('[') && part.endsWith(']')) {
			const emotionResult = emotion(part);
			return emotionResult !== part ? emotionResult : part;
		}
		return part;
	}).join('');
}

export function getEmotionTextById(id, targetCategory) {
	if (targetCategory) {
		const cat = emotionCategories.find(c => c.category === targetCategory);
		if (cat) {
			const found = cat.emotions.find(item => item.id === id);
			if (found) return found.text;
		}
	}
	for (const category of emotionCategories) {
		const found = category.emotions.find(item => item.id === id);
		if (found) return found.text;
	}
	return '';
}

export function getEmotionIdByText(text) {
	const mapping = emotionMap[text];
	return mapping ? mapping.id : -1;
}

export function getAllCategories() {
	return emotionCategories.map(cat => ({
		category: cat.category,
		imgDir: cat.imgDir,
		emotions: cat.emotions.map(item => ({
			...item,
			imgDir: cat.imgDir,
			url: getImgUrl(item.id, cat.imgDir),
		})),
	}));
}

export function getAllEmotions() {
	const allEmotions = [];
	emotionCategories.forEach(cat => {
		cat.emotions.forEach(item => {
			allEmotions.push({
				...item,
				category: cat.category,
				imgDir: cat.imgDir,
				url: getImgUrl(item.id, cat.imgDir),
			});
		});
	});
	return allEmotions;
}

export function checkEmotionAvailable(id, imgDir) {
	if (imgDir) return !!(emotionImages[imgDir] && emotionImages[imgDir][id]);
	return Object.values(emotionImages).some(dir => !!dir[id]);
}

export const emotionData = getAllEmotions();

export default {
	emotionData, emotionMap, getImgUrl, emotion, replaceEmotionText,
	parseMixedContent, getEmotionTextById, getEmotionIdByText,
	getAllEmotions, getAllCategories, checkEmotionAvailable,
};
