export const LEVEL_MEDIA_FOLDERS = Object.freeze({
  'level-1': '01.第一级 黄色Wow!Yellow（3-4岁）33集全',
  'level-2': '02.第二级 蓝色Wow!Blue(4-6岁) 33集全',
  'level-3': '03.第三级 红色Wow!Red（5-6岁）33集全',
  'level-4': '04.第四级 绿色Wow!Green（6-7岁）32集全',
  'level-5': '05.第五级 橘色Wow!Orange（7-8岁）33集全',
  'level-6': '06.第六级 青铜Wow!Bronze（8-9岁）25集全',
  'level-7': '07.第七级 银色Wow!Silver（9-10岁）26集全',
  'level-8': '08.第八级 金色Wow!Gold（10-12）26集全',
});

export const LEVEL_MEDIA_PREFIXES = Object.freeze(
  Object.values(LEVEL_MEDIA_FOLDERS).map((folder) => `Wow/${folder}/`),
);
