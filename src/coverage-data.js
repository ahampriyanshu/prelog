import {additionSpecs,additionAreas,additionFamilies} from './religion-additions.js';
import {historicalStages} from './historical-stages.js';
import {nodes,sources} from './data.js';
import {areas as baseAreas,regionalContexts} from './regional-contexts.js';
export const atlasDataset={id:'belief-thought',name:'Schools & ideas',category:'cultural-presence',description:'Religions, philosophical schools and political ideas',geometryBasis:'Illustrative settings of communities, teaching and organising; not exclusive territories or population estimates.'};
export const areas={...baseAreas,...additionAreas,
 mzab:[[2,34],[5,34],[6,31],[3,30]],
 nafusa:[[10,33],[14,33],[15,31],[11,30]],
 djerba:[[9.8,34.1],[11.5,34.1],[11.5,33],[9.8,33]],
 karnataka:[[73,18],[77,18],[79,15],[78,11],[75,11],[73,15]],
 kerala:[[74,13],[77,13],[78,9],[76,8],[74,10]],
 rajasthan:[[69,28],[75,30],[78,27],[76,23],[72,23]],
 bengal:[[85,27],[89,27],[92,24],[90,21],[86,22]],
 kashmir:[[72,36],[77,36],[79,33],[75,31],[72,33]],
 centralIndia:[[75,25],[81,27],[84,24],[82,20],[77,19],[74,22]],
 najd:[[41,28],[47,29],[50,25],[47,22],[42,23]],
 yemen:[[42,17],[49,18],[53,16],[49,12],[44,12]],
 oman:[[54,25],[58,26],[60,23],[57,18],[54,18]],
 france:[[-5,49],[2,51],[8,49],[8,44],[3,42],[-2,44]],
 germany:[[6,55],[13,55],[16,51],[13,47],[7,47]],
 lowCountries:[[2,52],[5,54],[8,53],[7,50],[4,50]],
 switzerland:[[6,48],[10,48],[11,46],[7,45]],
 poland:[[15,55],[23,55],[25,50],[20,48],[15,51]],
 ukraine:[[23,51],[31,53],[38,50],[37,46],[30,45],[24,48]],
 belarus:[[24,57],[30,57],[33,54],[29,51],[24,53]],
 russiaWest:[[29,61],[44,62],[52,56],[48,50],[38,49],[31,54]],
 scandinavia:[[5,59],[13,66],[22,68],[29,66],[25,59],[16,55],[9,55]],
 newEngland:[[-74,45],[-68,46],[-67,43],[-71,41],[-74,42]],
 california:[[-125,42],[-120,42],[-115,34],[-119,32],[-122,37]],
 cuba:[[-85,24],[-77,23],[-73,20],[-78,19],[-84,21]],
 himalayas:[[77,31],[84,32],[92,30],[95,28],[88,26],[81,28]],
};
export const families=[
 {id:'indian',name:'Indian philosophies & Hinduism',color:'#aa7f45',ids:'vedic upanishads ajivika charvaka hindu shaiva vaishnava shakta bhakti advaita kashmir ramanuja madhva gaudiya brahmo arya nyaya vaisheshika samkhya yoga mimamsa'},
 {id:'jain',name:'Jainism',color:'#aa7256',ids:'jainism digambara svetambara murtipujaka sthanakvasi terapanth'},
 {id:'islamic',name:'Islam & Islamic philosophy',color:'#4c8d82',ids:'islam sunni shia sufi falsafa mutazila hanafi maliki shafii hanbali twelver ismaili zaydi ibadi wahhabi salafi deobandi barelvi'},
 {id:'jewish',name:'Judaism',color:'#9276a5',ids:'israelite judaism rabbinic kabbalah hasidism orthodox-judaism modern-orthodox reform-judaism conservative-judaism reconstructionist chabad breslov'},
 {id:'buddhist',name:'Buddhism',color:'#be8546',ids:'buddhism early-schools theravada mahayana madhyamaka yogacara chinese-buddhism pure-land chan vajrayana tibetan shingon gelug navayana nyingma kagyu sakya soto nichiren'},
 {id:'christian',name:'Christianity',color:'#738db3',ids:'christianity nicaea oriental augustine catholic orthodox scholastic protestant pentecostal lutheran reformed anglican baptist methodist'},
 {id:'greek',name:'Greek & Roman philosophy',color:'#5d8f9c',ids:'presocratic plato aristotle epicurean stoicism neoplatonism'},
 {id:'modern',name:'Modern philosophy',color:'#797eae',ids:'humanism enlightenment nihilism pragmatism phenomenology existentialism absurdism feminism rationalism empiricism'},
 {id:'political',name:'Political ideologies',color:'#b26d62',ids:'liberalism socialism marxism communism anarchism leninism maoism social-democracy democratic-socialism'},
 {id:'east',name:'East Asian religions & philosophy',color:'#68946c',ids:'confucian mohism daoism legalism religious-daoism neoconfucian shinto'},
 {id:'african-american',name:'African & American religions & philosophy',color:'#90995d',ids:'africana ubuntu yoruba vodou maya nahua andean'},
 {id:'other',name:'Ancient religions & archaeology',color:'#ac8d75',ids:'mesopotamia egypt indus shang zoroastrian sikh bahai'},
].map(f=>({...f,ids:[...f.ids.split(' '),...(additionFamilies[f.id]||[])]}));
const distinctFamilies=[
 ['sikh','Sikhism','#aa9253',['sikh','nirankari','namdhari']],
 ['sant','Sant movements','#9c845e',['sant-nirankari','ravidassia','radhasoami','radhasoami-beas']],
 ['zoroastrian','Zoroastrianism','#a97d81',['zoroastrian']],
 ['bahai','Bahá’í Faith','#ac8d75',['bahai']],
 ['bon','Bön','#a28a69',['bon']],
 ['caodai','Cao Đài','#a183b0',['cao-dai']],
 ['scientology','Scientology','#7a9794',['scientology']],
 ['unitarian','Unitarian Universalism','#8b8d9f',['unitarian-universalist']],
];
for(const [id,name,color,ids] of distinctFamilies){for(const family of families)family.ids=family.ids.filter(key=>!ids.includes(key));families.push({id,name,color,ids});}
export const familyById=Object.fromEntries(families.map(f=>[f.id,f]));
const contexts=Object.fromEntries(regionalContexts.map(c=>[c.id,c]));
// [region, emergence horizon, wider setting, optional decline and fade].
// A region is a teaching/community setting, not an estimate of population share.
const specs={
 mesopotamia:{base:true},egypt:{base:true},indus:{base:true},shang:{base:true},zoroastrian:{base:true},sikh:{base:true},maya:{base:true},andean:{base:true},yoruba:{patches:[['yoruba',1200,1500]],place:'Selected Yoruba-speaking settings in West Africa'},
 vedic:{base:true,context:true},
 upanishads:{patches:[['ganges',-700,-500]],place:'Northern South Asian textual settings',parent:'vedic'},
 ajivika:{patches:[['ganges',-500,-250,0,600],['tamil',200,600,1000,1500]],place:'Magadhan beginnings and later southern Indian attestations'},
 charvaka:{patches:[['ganges',-400,500,1200,1600]],place:'Northern Indian philosophical debates; locations and chronology are uncertain'},
 hindu:{base:true,context:true},shaiva:{patches:[['deccan',200,700],['tamil',400,900],['kashmir',700,1000]],place:'Selected southern Indian and Kashmiri Śaiva centres',parent:'hindu'},
 vaishnava:{patches:[['ganges',-100,400],['tamil',500,1000],['gujarat',900,1400],['bengal',1400,1700]],place:'Selected Krishna- and Vishnu-devotional settings',parent:'hindu'},
 shakta:{patches:[['bengal',500,1100],['himalayas',800,1400],['tamil',900,1400]],place:'Selected goddess-worship settings in eastern, Himalayan and southern South Asia',parent:'hindu'},
 bhakti:{patches:[['tamil',600,900],['karnataka',1100,1400],['ganges',1300,1600]],place:'Selected regional devotional-literary centres',parent:'hindu'},
 advaita:{patches:[['kerala',750,850],['karnataka',850,1400],['ganges',900,1600]],place:'Selected South Indian and Varanasi teaching settings',parent:'upanishads',relation:'Vedānta interpretation',priority:100},
 kashmir:{patches:[['kashmir',900,1100]],place:'Kashmiri Śaiva philosophical centres',parent:'shaiva'},
 ramanuja:{patches:[['tamil',1100,1200],['karnataka',1120,1350]],place:'Tamil Śrīvaiṣṇava centres and Melukote-area teaching networks',parent:'vaishnava'},
 madhva:{patches:[['karnataka',1250,1400]],place:'Udupi and wider Karnataka teaching networks',parent:'vaishnava'},
 gaudiya:{patches:[['bengal',1510,1600],['ganges',1550,1700]],place:'Bengal and Vrindavan devotional centres',parent:'vaishnava'},
 brahmo:{patches:[['bengal',1828,1900]],place:'Bengal reform institutions',parent:'upanishads'},
 arya:{patches:[['gujarat',1875,1900],['punjab',1877,1920],['ganges',1880,1930]],place:'Selected western and northern Indian reform institutions',parent:'vedic'},
 nyaya:{patches:[['ganges',200,700],['bengal',1200,1500]],place:'Northern Indian and later Bengali centres of logic'},
 vaisheshika:{patches:[['ganges',100,500]],place:'Selected northern Indian textual settings'},
 samkhya:{patches:[['ganges',350,500]],place:'Northern Indian philosophical-textual settings'},
 yoga:{patches:[['ganges',400,700]],place:'Classical textual and teaching settings; not a map of all yoga practice'},
 mimamsa:{patches:[['ganges',-100,600],['tamil',700,1300]],place:'Selected northern and southern Indian exegetical settings'},
 jainism:{base:true,context:true},
 digambara:{patches:[['karnataka',200,800],['centralIndia',400,1200],['rajasthan',900,1500]],place:'Selected Karnataka, central Indian and Rajasthani communities',priority:98},
 svetambara:{patches:[['gujarat',200,900],['rajasthan',500,1200],['punjab',1400,1800]],place:'Selected western and northwestern Indian communities',priority:97},
 murtipujaka:{patches:[['gujarat',1000,1400],['rajasthan',1100,1500]],place:'Selected temple and monastic centres in Gujarat and Rajasthan'},
 sthanakvasi:{patches:[['gujarat',1650,1750],['rajasthan',1700,1850],['punjab',1800,1950]],place:'Selected western and northwestern Indian ascetic communities'},
 terapanth:{patches:[['rajasthan',1760,1850],['bengal',1900,2000]],place:'Rajasthan and selected later eastern Indian community settings'},
 buddhism:{base:true,context:true},
 'early-schools':{patches:[['ganges',-350,-200,500,1000],['deccan',-200,100,600,1200]],place:'Selected early South Asian monastic settings',parent:'buddhism',context:true},
 theravada:{patches:[['lanka',-250,-100],['mainlandSE',1000,1400]],place:'Sri Lankan lineages and later mainland Southeast Asian monastic settings',parent:'early-schools',priority:84},
 mahayana:{patches:[['ganges',-100,400,900,1400],['northChina',100,600],['southChina',250,700],['korea',375,700],['japan',550,900]],place:'Selected Mahāyāna textual, monastic and devotional settings',parent:'buddhism',context:true},
 madhyamaka:{patches:[['deccan',200,500,900,1400],['tibet',700,1200]],place:'Indian philosophical settings and Tibetan scholastic reception',parent:'mahayana'},
 yogacara:{patches:[['punjab',350,600,900,1400],['northChina',500,800],['tibet',800,1200]],place:'Northwestern Indian teaching and selected East Asian and Tibetan reception',parent:'mahayana'},
 'chinese-buddhism':{patches:[['northChina',100,600],['southChina',250,700]],place:'Selected Chinese translation and monastic settings',parent:'buddhism',context:true},
 'pure-land':{patches:[['southChina',400,900],['japan',900,1300]],place:'Selected Chinese and Japanese devotional centres',parent:'mahayana'},
 chan:{patches:[['southChina',600,900],['korea',800,1100],['japan',1191,1300]],place:'Chinese Chan, Korean Seon and Japanese Zen transmission settings',parent:'chinese-buddhism'},
 vajrayana:{patches:[['ganges',650,900,1100,1400],['tibet',700,1100],['himalayas',800,1300]],place:'Selected Indian tantric and Himalayan transmission settings',parent:'mahayana'},
 tibetan:{patches:[['tibet',775,1100],['himalayas',1000,1500]],place:'Selected Tibetan and Himalayan Buddhist institutions',parent:'vajrayana',context:true},
 shingon:{patches:[['japan',806,1000]],place:'Japanese esoteric Buddhist centres, including Kōyasan',parent:'vajrayana'},
 gelug:{patches:[['tibet',1409,1700],['himalayas',1600,1900]],place:'Selected Gelug monastic centres',parent:'tibetan'},
 navayana:{patches:[['deccan',1956,2000]],place:'Ambedkarite Buddhist communities in Maharashtra',parent:'buddhism'},
 nyingma:{patches:[['tibet',800,1200],['himalayas',1100,1600]],place:'Selected old-transmission Tibetan and Himalayan settings'},
 kagyu:{patches:[['tibet',1100,1400],['himalayas',1200,1600]],place:'Selected Kagyu transmission settings'},
 sakya:{patches:[['tibet',1073,1300]],place:'Sakya and selected Tibetan teaching settings'},
 soto:{patches:[['japan',1227,1500],['california',1960,2000]],place:'Japanese Sōtō institutions and a selected modern American teaching centre'},
 nichiren:{patches:[['japan',1253,1500]],place:'Selected Japanese Lotus-centred communities'},
 confucian:{base:true},mohism:{patches:[['northChina',-430,-300,-200,100]],place:'Warring States Chinese teaching settings'},
 daoism:{patches:[['northChina',-350,-100],['southChina',100,500]],place:'Selected settings of classical Daoist textual reception'},
 legalism:{patches:[['northChina',-300,-200,-100,200]],place:'Warring States and early imperial Chinese political debates'},
 'religious-daoism':{patches:[['southChina',142,700]],place:'Selected organised Daoist community settings',parent:'daoism'},
 neoconfucian:{patches:[['southChina',1100,1250],['korea',1300,1600],['japan',1500,1700],['vietnam',1400,1700]],place:'Song Chinese learning and selected East Asian institutions',parent:'confucian'},shinto:{base:true},
 israelite:{patches:[['levant',-1000,-700,-500,-200]],place:'Israelite and Judahite settings'},
 judaism:{patches:[['levant',-515,-200,70,300],['mesopotamia',-500,-200,100,500]],place:'Selected Second Temple-era Jewish settings',parent:'israelite',context:true},
 rabbinic:{patches:[['levant',200,500],['mesopotamia',300,700],['westernEurope',900,1300]],place:'Rabbinic scholarly centres, followed by selected medieval European reception',parent:'judaism',context:true},
 kabbalah:{patches:[['iberia',1200,1350,1492,1600],['levant',1500,1650],['easternEurope',1600,1800]],place:'Selected Iberian, Safed and eastern European mystical centres',parent:'rabbinic'},
 hasidism:{patches:[['ukraine',1750,1800,1940,1950],['poland',1780,1850,1940,1950],['eastUS',1880,1950],['levant',1850,1950]],place:'Eastern European origins and selected centres after migration and the Holocaust',parent:'rabbinic',priority:96},
 'orthodox-judaism':{patches:[['germany',1800,1850,1933,1950],['easternEurope',1800,1900,1940,1950],['eastUS',1850,1950],['levant',1850,1950]],place:'Selected modern Orthodox institutional settings',priority:95},
 'modern-orthodox':{patches:[['germany',1850,1900,1933,1950],['eastUS',1900,1960],['levant',1920,1970]],place:'Frankfurt-era institutions and selected American and Israeli communities'},
 'reform-judaism':{patches:[['germany',1810,1880,1933,1950],['eastUS',1840,1900],['britain',1840,1900]],place:'Selected German, American and British reform congregations'},
 'conservative-judaism':{patches:[['poland',1854,1880,1933,1950],['eastUS',1886,1950],['levant',1960,2000]],place:'Breslau scholarship and selected American and Israeli institutions'},
 reconstructionist:{patches:[['eastUS',1934,1970]],place:'Selected American communities and institutions'},
 chabad:{patches:[['belarus',1775,1850,1917,1950],['eastUS',1940,1970],['levant',1949,1980]],place:'Eastern European lineage settings and selected later centres'},
 breslov:{patches:[['ukraine',1802,1850,1940,1950],['levant',1900,1970],['eastUS',1940,1980]],place:'Bratslav and Uman settings and selected later communities'},
 christianity:{base:true,context:true},nicaea:{patches:[['anatolia',325,326,350,400]],place:'The council’s northwestern Anatolian setting',parent:'christianity'},
 oriental:{patches:[['nile',451,700],['ethiopia',500,1000],['levant',451,700]],place:'Selected Coptic, Ethiopian and Syriac church settings',parent:'christianity'},
 augustine:{patches:[['northAfrica',400,500,650,1000],['italy',400,600],['france',700,1200]],place:'North African and selected Latin Christian centres of reception',parent:'christianity'},
 catholic:{patches:[['italy',1054,1200],['france',1054,1200],['iberia',1054,1400],['poland',1054,1400],['mesoamerica',1520,1750],['andes',1530,1800],['brazil',1500,1800]],place:'Selected Latin Catholic institutions and later colonial-era encounters',parent:'christianity'},
 orthodox:{patches:[['aegean',1054,1200],['anatolia',1054,1200,1453,1900],['russiaWest',1054,1500],['easternEurope',1054,1500]],place:'Selected eastern Christian church settings',parent:'christianity'},
 scholastic:{patches:[['france',1250,1300],['italy',1250,1300],['britain',1250,1400]],place:'Selected medieval university and teaching settings',parent:'catholic'},
 protestant:{patches:[['germany',1517,1600],['britain',1530,1700],['northAmerica',1600,1800]],place:'Selected Reformation and later transatlantic institutions',parent:'christianity',context:true},
 pentecostal:{patches:[['california',1906,1920],['brazil',1910,1970],['westAfrica',1920,1980],['southernAfrica',1910,1960]],place:'Azusa Street and selected later Pentecostal communities',parent:'protestant'},
 lutheran:{patches:[['germany',1517,1570],['scandinavia',1525,1600],['northAmerica',1700,1900]],place:'German and Nordic church settings and later North American communities'},
 reformed:{patches:[['switzerland',1536,1570],['lowCountries',1560,1650],['britain',1560,1650],['newEngland',1620,1750]],place:'Swiss, Dutch, Scottish and selected transatlantic settings'},
 anglican:{patches:[['britain',1534,1600],['eastUS',1607,1750],['eastAfrica',1850,1950]],place:'English church institutions and selected later Anglican communities'},
 baptist:{patches:[['lowCountries',1609,1620],['britain',1612,1700],['eastUS',1639,1800]],place:'Amsterdam, English and selected American congregational settings'},
 methodist:{patches:[['britain',1738,1800],['eastUS',1760,1850],['westAfrica',1830,1950]],place:'British revival and selected American and West African communities'},
 islam:{base:true,context:true},
 sunni:{patches:[['mesopotamia',750,900],['northAfrica',800,1200],['anatolia',1100,1600],['punjab',1000,1600],['maritimeSE',1275,1650]],place:'Selected Sunni scholarly and community settings',parent:'islam',priority:93},
 shia:{patches:[['mesopotamia',680,900],['iran',800,1600],['levant',900,1500]],place:'Selected Shi‘i scholarly and community settings',parent:'islam',priority:92},
 sufi:{patches:[['mesopotamia',800,1000],['iran',900,1200],['punjab',1100,1400],['westAfrica',1400,1800]],place:'Selected Sufi teaching and devotional networks',parent:'islam',relation:'Spiritual disciplines',note:'Sufi affiliations can coexist with Sunni or Shi‘i identities and legal schools.'},
 falsafa:{patches:[['mesopotamia',850,1000],['iran',900,1200],['iberia',1000,1200,1300,1500]],place:'Baghdad, Iranian and Andalusi philosophical centres',parent:'islam',relation:'Intellectual context'},
 mutazila:{patches:[['mesopotamia',750,900,1100,1300],['yemen',1100,1400]],place:'Basran and Baghdadi debates and later Yemeni intellectual reception',parent:'islam'},
 hanafi:{patches:[['mesopotamia',767,950],['bactria',900,1200],['anatolia',1300,1600],['punjab',1100,1600],['ganges',1200,1700]],place:'Selected Iraqi, Central Asian, Ottoman and South Asian legal settings'},
 maliki:{patches:[['hijaz',795,900],['northAfrica',800,1100],['westAfrica',1100,1700]],place:'Medinan scholarship and selected North and West African legal settings'},
 shafii:{patches:[['nile',820,1000],['yemen',900,1300],['eastAfrica',1000,1600],['maritimeSE',1300,1700]],place:'Egyptian and selected Indian Ocean legal networks'},
 hanbali:{patches:[['mesopotamia',855,1100],['levant',1100,1400],['najd',1500,1800]],place:'Iraqi, Syrian and Najdi scholarly settings'},
 twelver:{patches:[['mesopotamia',874,1100],['iran',1000,1600]],place:'Iraqi scholarly centres and Iranian communities; later Safavid institutions'},
 ismaili:{patches:[['mesopotamia',765,900,1000,1200],['northAfrica',909,1050,1100,1300],['nile',969,1100,1171,1400],['bactria',1100,1500],['gujarat',1200,1700]],place:'Selected early mission, Fatimid and later Central and South Asian community settings'},
 zaydi:{patches:[['mesopotamia',740,800,900,1100],['yemen',897,1200]],place:'Early Iraqi context and enduring Yemeni scholarly and community settings'},
 ibadi:{patches:[['oman',750,900],['mzab',1000,1200],['nafusa',800,1000],['djerba',900,1200]],place:'Selected Omani and North African communities'},
 wahhabi:{patches:[['najd',1744,1800],['hijaz',1925,1950]],place:'Najdi origins and later Saudi religious institutions',priority:94},
 salafi:{patches:[['nile',1920,1950],['hijaz',1925,1960],['najd',1930,1970]],place:'Selected twentieth-century publishing and teaching settings; networks extend much further'},
 deobandi:{patches:[['ganges',1866,1900],['punjab',1880,1930],['britain',1960,1990]],place:'North Indian seminaries and selected later Pakistani and British institutions'},
 barelvi:{patches:[['ganges',1880,1920],['punjab',1900,1950],['britain',1960,1990]],place:'North Indian devotional scholarship and selected Pakistani and British communities'},
 bahai:{patches:[['iran',1863,1900],['levant',1868,1950],['eastUS',1890,1950]],place:'Iranian origins, the Acre–Haifa setting and selected American communities'},
 presocratic:{patches:[['aegean',-600,-450,-300,100]],place:'Ionian and Aegean philosophical settings',context:true},
 plato:{patches:[['aegean',-387,-250,400,600]],place:'Athens and the later antique Platonic school setting'},
 aristotle:{patches:[['aegean',-335,-200,200,600],['mesopotamia',850,1000,1300,1600],['france',1200,1400]],place:'The Lyceum and selected Arabic and Latin reception settings'},
 epicurean:{patches:[['aegean',-306,-200,200,500],['italy',-100,100,200,500],['france',1600,1700]],place:'Athenian and Roman schools, followed by selected early modern reception'},
 stoicism:{patches:[['aegean',-300,-150,200,500],['italy',-100,100,300,600],['lowCountries',1584,1650],['britain',1600,1750],['eastUS',1950,2025]],place:'Athenian and Roman schools, then selected Neostoic and modern reception settings',priority:99},
 neoplatonism:{patches:[['italy',250,350,500,700],['nile',300,450,600,800],['italy',1450,1500]],place:'Roman and Alexandrian philosophical centres and Renaissance reception'},
 humanism:{patches:[['italy',1400,1500],['france',1450,1550],['lowCountries',1450,1550]],place:'Selected Renaissance scholarly and educational centres'},
 enlightenment:{patches:[['france',1700,1770],['britain',1700,1770],['germany',1720,1800],['eastUS',1750,1800]],place:'Selected European and transatlantic centres of public debate'},
 rationalism:{patches:[['france',1637,1700],['lowCountries',1650,1700],['germany',1680,1750]],place:'Selected French, Dutch and German philosophical settings'},
 empiricism:{patches:[['britain',1690,1750]],place:'Selected British and Irish philosophical settings'},
 liberalism:{patches:[['britain',1689,1750],['france',1750,1850],['eastUS',1776,1850]],place:'Selected intellectual and political organising centres'},
 socialism:{patches:[['britain',1830,1870],['france',1830,1870],['germany',1840,1900]],place:'Selected European centres of socialist writing and labour organising',context:true},
 marxism:{patches:[['germany',1848,1880],['britain',1848,1880],['russiaWest',1880,1920],['northChina',1920,1950]],place:'Selected centres of Marxist writing, debate and organising',priority:88},
 communism:{patches:[['britain',1848,1880],['russiaWest',1917,1940,1985,1992],['northChina',1921,1950],['cuba',1961,1980]],place:'Selected communist organising and governing centres; not an exhaustive map of communist states',priority:98},
 leninism:{patches:[['russiaWest',1902,1920,1985,1992],['northChina',1921,1950]],place:'Bolshevik organising and selected later party reception'},
 maoism:{patches:[['northChina',1940,1950],['southChina',1949,1960]],place:'Selected Chinese revolutionary and later institutional settings'},
 'social-democracy':{patches:[['germany',1875,1910],['scandinavia',1889,1930],['britain',1900,1945]],place:'Selected German, Nordic and British labour-party settings'},
 'democratic-socialism':{patches:[['britain',1890,1920],['germany',1890,1920],['france',1900,1930]],place:'Selected European democratic-socialist organising settings'},
 anarchism:{patches:[['france',1840,1870],['iberia',1870,1910],['italy',1870,1900]],place:'Selected European anarchist writing and organising settings'},
 nihilism:{patches:[['russiaWest',1862,1880],['germany',1880,1900]],place:'Russian literary-political and German philosophical debates',priority:82},
 pragmatism:{patches:[['newEngland',1878,1900],['eastUS',1900,1930]],place:'Selected American philosophical and educational centres'},
 phenomenology:{patches:[['germany',1900,1920],['france',1930,1950]],place:'Selected German and French philosophical settings'},
 existentialism:{patches:[['france',1943,1950],['germany',1943,1960]],place:'Selected twentieth-century philosophical and literary centres',priority:83},
 absurdism:{patches:[['france',1942,1950],['northAfrica',1942,1950]],place:'Camus’s French and Algerian intellectual settings; not a population affiliation',priority:86},
 feminism:{patches:[['france',1949,1970],['eastUS',1949,1970],['britain',1949,1970]],place:'Selected twentieth-century feminist philosophical centres; earlier and global histories extend beyond this entry'},
 africana:{patches:[['westAfrica',1960,1970],['eastUS',1960,1970],['southernAfrica',1960,1990]],place:'Selected decolonial and diasporic philosophical debates'},
 ubuntu:{patches:[['southernAfrica',1990,2000]],place:'Southern African public philosophical debates; the traditions are older'},
 vodou:{patches:[['caribbean',1700,1850]],place:'Haitian ritual and community settings'},
 nahua:{patches:[['mesoamerica',1400,1500]],place:'Central Mexican intellectual and ritual settings'},
};
const variants=['#557e97','#ad8353','#8e70a0','#5d9383','#a66d67','#7e8e56'];
const important=['advaita','stoicism','communism','digambara','svetambara','sunni','shia','wahhabi','hasidism','orthodox-judaism','absurdism','nihilism','marxism','theravada'];
export const featuredIds=important;
const patch=([area,start,wider,end,fade])=>({area,frames:[[start,start===wider ? .78 : .22],[wider===start?start+1:wider,.78],...(end===undefined?[]:[[end,.78],[fade,0]])]});
const centre=area=>areas[area].reduce((a,p)=>[a[0]+p[0]/areas[area].length,a[1]+p[1]/areas[area].length],[0,0]);
// Animation keyframes are not historical events. New entries expose only the
// documented milestone and separately sourced settings, never the one-year ramp.
const settingName=key=>key.replace(/^(south|west|world)/,'').replace(/([a-z])([A-Z])/g,'$1 $2');
function documentedStages(n,spec){
 const years=[...new Set([n.year,...spec.patches.map(p=>p[1])])].sort((a,b)=>a-b);
 return years.map(year=>({year,title:year===n.year?n.date||n.name:spec.patches.filter(p=>p[1]===year).map(p=>settingName(p[0])).join(' · '),text:year===n.year?n.summary:spec.place+'.'}));
}
export const coverage=nodes.map((n,i)=>{
 const spec=additionSpecs[n.id]||specs[n.id];if(!spec)throw new Error(`Missing individual map specification: ${n.id}`);
 const family=families.find(f=>f.ids.includes(n.id));if(!family)throw new Error(`Missing catalogue family: ${n.id}`);
 const base=spec.base?contexts[n.id]:null;
 const patches=base?.patches||spec.patches.map(patch);
 const parentId=n.parentId||spec.parent||null;
 const reading=sources[n.source];
 const start=Math.min(...patches.map(p=>p.frames[0][0]));
 const dates=[...new Set(patches.flatMap(p=>[p.frames[0][0],p.frames[1][0],...(p.frames.length>2?[p.frames.at(-1)[0]]:[])]))].sort((a,b)=>a-b);
 const place=spec.place||base?.stages[0].text;
 const stages=(additionSpecs[n.id]?documentedStages(n,spec):null)||historicalStages[n.id]?.map(([year,title,text])=>({year,title,text}))||base?.stages||dates.map((year,index)=>({year,title:index===0?'First mapped setting':patches.some(p=>p.frames[0][0]===year)?'Another regional setting':patches.some(p=>p.frames.at(-1)[0]===year&&p.frames.at(-1)[1]===0)?'A changing landscape':'Teaching & community networks',text:index===0?`${place}. ${n.date||'Dates are approximate historical milestones.'}`:year===dates.at(-1)?`${place}. Shading follows selected communities, institutions or intellectual reception; it does not quantify adherence.`:`The depicted settings change as new communities or centres of reception enter this record. ${place}.`}));
 return {id:n.id,name:n.name,kind:n.kind,family:family.id,parentId,relation:n.relation||spec.relation||(n.kind==='philosophy'?'Philosophical school':n.kind==='context'?'Historical context':'Religious history'),context:Boolean(spec.context),color:important.includes(n.id)?variants[important.indexOf(n.id)%variants.length]:family.color,label:base?.label||centre(patches[0].area),patches,stages,start,place,summary:n.summary,priority:spec.priority||30,geographyNote:spec.note||null,members:[n.id],readings:[...(base?.readings||[]),{title:reading[1]+' · '+reading[0],url:reading[2]},...[...new Set([...(n.sourceRefs||[]),...(spec.sourceRefs||[])])].map(key=>({title:sources[key][1]+' · '+sources[key][0],url:sources[key][2]}))]};
});
export const coverageById=Object.fromEntries(coverage.map(c=>[c.id,c]));
for(const item of coverage)item.members.push(...coverage.filter(c=>c.parentId===item.id).map(c=>c.id));
export const coverageForNode=id=>coverageById[id];
export function lineageFor(id){const chain=[],seen=new Set();let item=coverageById[id];while(item&&!seen.has(item.id)){seen.add(item.id);chain.unshift(item);item=coverageById[item.parentId];}return chain;}
