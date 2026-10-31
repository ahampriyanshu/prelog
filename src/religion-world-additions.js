// Named schools and religions; dates distinguish historical horizons from
// commemorated foundations. Source pages were checked on 2026-10-31.
// All polygons below are small, diagrammatic settings around named places.
// They are NOT surveyed religious boundaries, majorities or demographic data.
// Equal start/wider dates deliberately request a constant-size setting; the
// integration layer must not turn these into an invented growth trajectory.
const r=(id,name,year,region,kind,parentId,relation,summary,ideas,source,extra={})=>({id,name,year,region,kind,parentId,relation,summary,ideas:ideas.split('|'),source,approx:true,...extra});

export const additionReadings={
 worldBon:['Bön and its historical meanings','Charles Ramble · Rubin Museum, Project Himalayan Art','https://rubinmuseum.org/projecthimalayanart/essays/bon-deity-trowo-tsochok-khagying/'],
 worldMenri:['Menri: foundation, location and later destruction','The Treasury of Lives','https://treasuryoflives.org/institution/Menri'],
 worldBonDolanji:['The Bön lineage of teachers','Ligmincha International','https://ligmincha.org/the-bon-lineage-of-teachers/'],
 worldBonDolanjiHistory:['Lopon Tenzin Namdak and the 1967 Dolanji settlement, p. 26','Ligmincha Europe Magazine · spring 2018','https://ligmincha.org/wp-content/uploads/2021/06/28-Ligmincha-Europe-Magazine-Spring-2018_compressed.pdf'],
 worldTiantai:['Tiantai Buddhism','Brook Ziporyn · Stanford Encyclopedia of Philosophy','https://plato.stanford.edu/entries/buddhism-tiantai/'],
 worldHuayan:['Huayan Buddhism','Stanford Encyclopedia of Philosophy','https://plato.stanford.edu/entries/buddhism-huayan/'],
 worldKegonHistory:['Tōdai-ji: the 752 consecration and continuing religious practice','Tōdai-ji · official history','https://www.todaiji.or.jp/en/history/'],
 worldKegonSchool:['Tōdai-ji, head temple of the Kegon school','Tōdai-ji · official KIDS introduction','https://www.todaiji.or.jp/kids/kids2-1.html'],
 worldKegonTeaching:['Vairocana and the Avataṃsaka Sūtra at Tōdai-ji','Tōdai-ji · official Great Buddha Hall guide','https://www.todaiji.or.jp/en/information/daibutsuden/'],
 worldTendai:['History of Enryakuji and the Tendai school','Hieizan Enryakuji · official history','https://hieizan.or.jp/about/history.html'],
 worldRinzai:['The transmission of Zen to Japan','Joint Council for Japanese Rinzai and Ōbaku Zen','https://zen.rinnou.net/whats_zen/history.html'],
 worldJodo:['An introduction to Jōdo-shū','Jōdo-shū · official introduction','https://jodo.or.jp/jodoshu/first-time/'],
 worldShin:['Chronology of Shinran and Hongwanji','Jōdo Shinshū Hongwanji-ha','https://www.hongwanji.or.jp/english/history/chrono.html'],
 worldShinTeaching:['Jōdo Shinshū: the teaching of Shinran','Shinshū Ōtani-ha · Higashi Honganji','https://english.higashihonganji.or.jp/buddhism/'],
 worldObaku:['Manpukuji and Ingen','Ōbaku-san Manpukuji · official introduction','https://www.obakusan.or.jp/en/'],
 worldSoka:['History of the Soka Gakkai','Soka Gakkai · institutional history','https://www.sokaglobal.org/about-the-soka-gakkai/our-history.html'],
 worldMakiguchi:['Makiguchi’s Tokyo teaching and the 1930 educational society','Tsunesaburo Makiguchi Website · biography','https://www.tmakiguchi.org/biography.html'],
 worldWon:['The Funerary Rites of Won Buddhism in Korea','Kwangsoo Park · Religions, 2020','https://www.mdpi.com/2077-1444/11/7/324'],
 worldWonHistory:['History: 1916 awakening and 1924 Iksan headquarters','Won Buddhism · official chronology','https://won.or.kr/info/guide2_1.jsp?m=2&s=1'],
 worldCaodai:['A brief history and philosophy of Caodaism','Christopher Hartney · University of Sydney; hosted by the Sacerdotal Council','https://caodai.com.vn/en/news-detail/a-brief-history-and-philosophy.html'],
 worldCaodaiInauguration:['Cao Dai understanding of God and the 1926 inauguration','The Sacerdotal Council of Caodaism','https://caodai.com.vn/en/news-detail/cao-dai-understanding-of-god.html'],
 worldHoaHao:['Hòa Hảo Buddhism: religious group profile','Association of Religion Data Archives','https://www.thearda.com/us-religion/group-profiles/groups?D=395'],
 worldHoaHaoPlace:['Hòa Hảo Buddhism: early community and 1939 foundation','Vietnam Government Committee for Religious Affairs','https://religion.vn/religion/hoa-hao-buddhism-post1XR2O0Za4N.html'],
 worldTenri:['Tenrikyō: teachings, history and Jiba','Tenrikyō Church Headquarters','https://www.tenrikyo.org/eng/'],
 worldKonko:['Konkōkyō: foundation and headquarters','Konkōkyō · official facts','https://konkokyo.jp/eng/come_on_in/facts.html'],
 worldKonkoTeaching:['Basic precepts and toritsugi mediation','Konkōkyō · official teachings','https://konkokyo.jp/eng/our_faith/basic_precepts.html'],
 worldOomoto:['The history of Oomoto','Oomoto · institutional history','https://oomoto.or.jp/wp/english/history-of-oomoto/the-history-of-oomoto-from-the-oomoto-international-jan-mar-1980-apr-jun-1982/'],
 worldDonghak:['Birthplace of the Donghak Religion','Academy of Korean Studies · HeritageWiki','https://dh.aks.ac.kr/~heritage/wiki/index.php/%EA%B2%BD%EC%A3%BC_%EB%8F%99%ED%95%99_%EB%B0%9C%EC%83%81%EC%A7%80'],
 worldAfroBrazil:['Referências sociais das religiões afro-brasileiras','Reginaldo Prandi · Universidade de São Paulo, Horizontes Antropológicos, 1998','https://www.scielo.br/j/ha/a/g35m5TSrGjDp9HxYGjBqNGg/?format=pdf'],
 worldCandombleNacoes:['Tradição e socialização nos terreiros de Candomblé de Uberaba-MG','Psicologia & Sociedade · research on distinct ritual lineages','https://www.scielo.br/j/psoc/a/77BTpWW3yFzKqpSCtB7d9ZS/?lang=pt'],
 worldCasaBranca:['Terreiro Casa Branca / Ilê Axé Iyá Nassô Oká','Júlia Morim · Fundação Joaquim Nabuco','https://pesquisaescolar.fundaj.gov.br/pt-br/artigo/terreiro-casa-branca-ile-axe-iya-nasso-oka/'],
 worldLucumi:['Santería Enthroned: Art, Ritual, and Innovation in an Afro-Cuban Religion','David H. Brown · Routledge','https://www.routledge.com/Santeria-Enthroned-Art-Ritual-and-Innovation-in-an-Afro-Cuban-Religion/Brown/p/book/9780429318566'],
 worldRastafari:['Rastafari livity and scholarship: the 1930 and Kingston milestones','University of the West Indies','https://sta.uwi.edu/news/ecalendar/event.asp?id=1053'],
 worldRastafariPractice:['Discovering Rastafari!','Smithsonian National Museum of Natural History','https://www.si.edu/exhibitions/discovering-rastafari%3Aevent-exhib-210'],
 worldDaime:['A política das religiões ayahuasqueiras brasileiras','Sandra Lucia Goulart · Religião & Sociedade, 2019','https://www.scielo.br/j/rs/a/K4MWMcJxccGDN6vQTqrTZVr/?lang=pt'],
 worldDaimePractice:['Correntes do Conhecimento: the bailado of Santo Daime','Revista Brasileira de Estudos da Presença','https://www.scielo.br/j/rbep/a/MkWtmVyCvWWKqCWv8pHMFTb/?lang=en'],
 worldUdv:['About the União do Vegetal','Centro Espírita Beneficente União do Vegetal','https://udv.org.br/en/about-us/'],
 worldUdvOrigin:['The 1961 foundation at Seringal Sunta, Bolivia','Centro Espírita Beneficente União do Vegetal · institutional account','https://udv.org.br/blog/a-criacao-da-udv/'],
};

export const additionRecords=[
 r('bon','Bön · Yungdrung Bön',1000,'east','religion',null,'Distinct Tibetan religion','A Tibetan religion with its own scriptures, ritual lineages and monastic learning. Yungdrung Bön takes documented shape in dialogue with Buddhism while maintaining a distinct identity.','Shenrab Miwo|Ritual lineages|Monastic learning','worldBon',{aliases:'bon bön bonpo yungdrung eternal bon',date:'10th–11th centuries · organised Yungdrung Bön emerges',note:'This horizon is distinct from earlier Tibetan ritual practices and from the much older sacred chronology of Shenrab Miwo. The first precisely located setting here is Menri, founded in 1404 or 1405; no Buddhist parentage is asserted.'}),
 r('tiantai','Tiantai',580,'east','religion','chinese-buddhism','Chinese Buddhist school','Zhiyi and later teachers develop a Lotus Sūtra-centred synthesis of meditation and philosophy, explaining emptiness, conventional existence and the middle through the Three Truths.','Lotus Sūtra|Three Truths|Contemplation','worldTiantai',{aliases:'tiantai tien tai tian tai zhiyi chih i',date:'Late 6th century · Zhiyi’s teaching horizon',note:'The plotted year is an approximate horizon within Zhiyi’s lifetime, not a documented founding day. Later Chinese Tiantai and Japanese Tendai have distinct institutional histories.'}),
 r('huayan','Huayan',650,'east','religion','chinese-buddhism','Chinese Buddhist school','Interpreters of the Flower Garland Sūtra explain how each phenomenon depends on and interpenetrates every other. Zhiyan, Fazang and later thinkers develop distinctive philosophical arguments.','Interdependence|Flower Garland Sūtra|One and many','worldHuayan',{aliases:'huayan hua yen huayen avatamsaka fazang zhiyan',date:'7th century · Zhiyan and Fazang’s school formation',note:'The plotted date follows Zhiyan’s return to Chang’an in the late 640s. The mapped Tang setting ends with the 842–846 persecution, not the end of Huayan. Its Japanese reception is shown separately as Kegon, including a continuing institution at Tōdai-ji.'}),
 r('kegon','Kegon',752,'east','religion','huayan','Japanese Huayan reception','Japan’s reception of Huayan centres on the Flower Garland Sūtra and Vairocana Buddha. Tōdai-ji in Nara remains the Kegon school’s head temple and a place of Buddhist worship.','Flower Garland Sūtra|Vairocana Buddha|Interdependence','worldKegonHistory',{approx:false,aliases:'kegon kegonshu kegon shū todai ji todaiji tōdai-ji nara huayan',date:'752 · Tōdai-ji Great Buddha consecration',note:'752 is a documented ceremony at this selected institution, not the first transmission or founding date of Kegon in Japan. The Nara setting remains visible through the modern endpoint; fires, reconstruction and institutional change are not treated as the extinction of this lineage.'}),
 r('tendai','Tendai',806,'east','religion','tiantai','Japanese Buddhist transmission','Saichō establishes a Japanese school centred on the Lotus Sūtra and Mount Hiei, bringing together meditation, esoteric practice and Mahāyāna discipline.','Lotus Sūtra|One vehicle|Mount Hiei','worldTendai',{approx:false,aliases:'tendai saicho saichō enryakuji hiei',date:'806 · official recognition of the Tendai school',note:'Saichō’s Mount Hiei foundation dates to 788. The marker is the 806 institutional milestone, not the beginning of all practices later taught at Enryakuji.'}),
 r('rinzai','Rinzai Zen',1191,'east','religion','chan','Japanese Zen lineage','Japanese Rinzai lineages develop through Chinese Linji transmissions, monastic discipline and meditation. Later Ōtōkan and Hakuin lineages shape its kōan training.','Zazen|Kōan inquiry|Teacher transmission','worldRinzai',{approx:false,aliases:'rinzai linji eisai yosai hakuin',date:'1191 · Eisai returns from China',note:'Eisai’s return is a transmission milestone. Present Rinzai lineages are not simply an unbroken continuation of his Huanglong lineage; the first Kyoto setting here begins with Kenninji in 1202.'}),
 r('jodo-shu','Jōdo-shū',1175,'east','religion','pure-land','Japanese Pure Land school','Hōnen teaches reliance on Amida Buddha’s vow through reciting the nembutsu, opening Pure Land practice beyond demanding forms of monastic training.','Nembutsu|Amida’s vow|Pure Land','worldJodo',{approx:false,aliases:'jodo shu jodoshu honen hōnen pure land',date:'1175 · Hōnen’s teaching milestone',note:'Jōdo-shū is a specific Japanese school, distinct from Jōdo Shinshū and the wider East Asian history of Pure Land devotion.'}),
 r('jodo-shinshu','Jōdo Shinshū',1224,'east','religion','jodo-shu','Shinran’s Pure Land interpretation','Shinran emphasises entrusting oneself to Amida’s vow and understands nembutsu through gratitude and Other Power. His followers develop multiple Shin Buddhist institutions.','Shinjin|Other Power|Nembutsu','worldShin',{aliases:'jodo shinshu jodoshinshu shin buddhism shinran hongwanji honganji',date:'c. 1224 · Kyōgyōshinshō milestone',note:'1224 is the commemorated year associated with Shinran’s major writing, not the foundation of every later denomination. Kanto teaching begins earlier; this record shows Hitachi from the textual milestone and Kyoto’s mausoleum community from 1272.'}),
 r('obaku','Ōbaku Zen',1654,'east','religion','chan','Ming Chinese Zen transmission','Ingen and other Chinese monks establish a Japanese Zen lineage preserving distinctive Ming-era liturgy, monastic practice and material culture, centred on Manpukuji.','Zen meditation|Chinese liturgy|Monastic discipline','worldObaku',{approx:false,aliases:'obaku ōbaku ingen yinyuan manpukuji',date:'1654 · Ingen arrives in Nagasaki',note:'Manpukuji at Uji is founded in 1661. Ōbaku is a distinct later Chinese transmission; it is not a branch founded by Eisai.'}),
 r('soka-gakkai','Sōka Gakkai',1930,'east','religion','nichiren','Modern lay Buddhist movement','A movement emerging from Japanese educational reform develops a lay practice of Nichiren Buddhism centred on chanting, study and transforming everyday life.','Nam-myōhō-renge-kyō|Lay practice|Value creation','worldSoka',{approx:false,aliases:'soka gakkai sōka sgi makiguchi toda ikeda',date:'1930 · commemorated educational society foundation',note:'18 November marks publication of Makiguchi’s educational work under the Sōka Kyōiku Gakkai name. The religious movement develops thereafter; Soka Gakkai International is a later organisation, established in 1975.'}),
 r('won-buddhism','Won Buddhism',1916,'east','religion','buddhism','Modern Korean Buddhist movement','Sot’aesan develops a Buddhist path integrating spiritual cultivation and everyday activity. The circle, Il-Won-Sang, expresses the truth toward which its teaching and practice point.','Il-Won-Sang|Everyday cultivation|Ethical practice','worldWon',{approx:false,aliases:'won buddhism wonbulgyo sot aesan sotaesan park joongbin',date:'1916 · Sot’aesan’s awakening milestone',note:'The Research Society of Buddha Dharma is organised in 1924; the Won Buddhism name is adopted after liberation. The map distinguishes the Yeonggwang founding setting from Iksan headquarters in 1924.'}),
 r('cao-dai','Cao Đài',1926,'east','religion',null,'Distinct Vietnamese religion','A Vietnamese religion formed through spirit-medium circles brings several religious inheritances into a universalist account of revelation, ethical cultivation and worship of the Supreme Being.','Divine Eye|Revelation|Religious unity','worldCaodai',{approx:false,aliases:'cao dai cao đài caodai caodaism',date:'1926 · public inauguration in Tây Ninh',note:'The 1926 milestone follows earlier revelations and separate mediumship circles. Cao Đài includes distinct branches; the Tây Ninh centre does not stand for the exclusive extent or authority of all of them.'}),
 r('hoa-hao','Hòa Hảo Buddhism',1939,'east','religion','buddhism','Vietnamese Buddhist reform','Huỳnh Phú Sổ’s movement places Buddhist ethics and the four debts of gratitude within everyday household life, reducing elaborate ritual and institutional requirements.','Four debts|Household practice|Buddhist ethics','worldHoaHao',{approx:false,aliases:'hoa hao hòa hảo hoahao huynh phu so',date:'1939 · foundation in Hòa Hảo village',note:'The religious community has a history distinct from associated political parties and armed organisations. A local founding setting is shown, not political control or the whole Mekong Delta.'}),
 r('tenrikyo','Tenrikyō',1838,'east','religion',null,'Distinct Japanese religion','Nakayama Miki’s teachings centre God the Parent and the Joyous Life, expressed through mutual help, the Service and religious practice around Jiba.','God the Parent|Joyous Life|Mutual help','worldTenri',{approx:false,aliases:'tenrikyo tenrikyō nakayama miki oyasama jiba',date:'1838 · commemorated founding revelation',note:'The record treats Tenrikyō as a distinct religion. Its historical legal classification under Shinto does not make its teachings interchangeable with shrine Shinto.'}),
 r('konkokyo','Konkōkyō',1859,'east','religion',null,'Distinct Japanese religion','Konkō Daijin teaches a reciprocal relationship with Tenchi Kane No Kami. Toritsugi mediation brings personal concerns into religious dialogue and practice.','Toritsugi mediation|Divine parent|Everyday gratitude','worldKonko',{approx:false,aliases:'konkokyo konkōkyō konko daijin kawate bunjiro',date:'1859 · Konkō Daijin’s religious vocation',note:'The movement emerges from a Shinto-related setting and later receives its own institutional recognition. Its founding setting is present-day Konko-chō, Asakuchi, Okayama.'}),
 r('oomoto','Ōmoto',1892,'east','religion',null,'Japanese new religion','Nao Deguchi’s revelations and Onisaburō Deguchi’s teaching form a religion of spiritual renewal, divine-human cooperation and the shared origins of religions.','Revelation|World renewal|Religious unity','worldOomoto',{approx:false,aliases:'oomoto omoto ōmoto deguchi nao onisaburo',date:'1892 · Nao Deguchi’s first revelations at Ayabe',note:'The date concerns the movement’s own foundational revelation account. Ayabe is a selected historic centre, not a geographic claim about all adherents.'}),
 r('donghak-cheondogyo','Donghak · Cheondogyo',1860,'east','religion',null,'Korean religious movement','Choe Je-u’s Eastern Learning places human dignity and spiritual cultivation at the centre of a Korean religious movement later named Cheondogyo.','Heavenly Way|Human dignity|Spiritual cultivation','worldDonghak',{approx:false,aliases:'donghak tonghak cheondogyo chondogyo cheondoism chondoism choe je u',date:'1860 · Donghak foundation; Cheondogyo name from 1905',note:'The 1894 peasant movement and modern religious institutions are related histories, not interchangeable entities. The first setting is Yongdamjeong near Gyeongju.'}),
 r('candomble','Candomblé',1830,'africa','religion',null,'Afro-Brazilian religion','Brazilian temple communities preserve and transform African ritual inheritances through initiation, sacred music and relations with divinities. Ketu, Jeje and Angola houses retain distinctive languages and lineages.','Initiation|Orixás, voduns and inquices|Terreiro lineages','worldAfroBrazil',{aliases:'candomble candomblé ketu jeje angola orixas terreiro',date:'c. 1830 · Casa Branca community milestone',note:'African and Afro-Brazilian practices are older. The date and Salvador patch locate one documented early Ketu house; they are not the founding date or a single genealogy for all Candomblé.'}),
 r('umbanda','Umbanda',1920,'africa','religion',null,'Afro-Brazilian religion','Brazilian communities combine mediumship, service and relations with spirits through varied African, Indigenous, Spiritist and Catholic inheritances. Ritual authority remains distributed across distinct houses.','Mediumship|Service|Caboclos and pretos velhos','worldAfroBrazil',{aliases:'umbanda umbandista zelio zélio',date:'1920s–1930s · institutional formation horizon',note:'Founding narratives differ; no universal single founder or precise first day is asserted. The patch represents the documented Rio de Janeiro setting, not all Brazil.'}),
 r('lukumi','Lukumí · Santería',1850,'africa','religion','yoruba','Afro-Cuban diasporic development','Cuban ritual lineages transform Yoruba inheritances through initiation, divination and relationships with orichas, within changing colonial and postcolonial communities.','Orichas|Initiation|Divination','worldLucumi',{aliases:'lukumi lucumi lucumí lukumí santeria santería regla de ocha',date:'19th century · Cuban community formation',note:'1850 is an approximate navigation point within a long formation process, not a foundation. The Havana setting is one selected centre; names and ritual lineages vary among practitioners.'}),
 r('rastafari','Rastafari',1930,'africa','religion',null,'Jamaican religious movement','Jamaican interpretations of Haile Selassie’s coronation develop into a religious movement centred on African dignity, liberation and livity, with several distinct organisations and practices.','African dignity|Liberation|Livity','worldRastafari',{aliases:'rastafari rasta rastafarian nyabinghi bobo ashanti twelve tribes',date:'1930s · Jamaican emergence after Selassie’s coronation',note:'The coronation occurred in Ethiopia; the mapped formative community setting is Jamaica. Different Rastafari mansions are not collapsed into one centrally governed church.'}),
 r('santo-daime','Santo Daime',1930,'americas','religion',null,'Brazilian Amazonian religion','Communities formed around Raimundo Irineu Serra combine sung teachings, collective ritual and sacramental use of ayahuasca. Later lineages develop different institutions and paths of expansion.','Hymns|Collective ritual|Spiritual discipline','worldDaime',{aliases:'santo daime daime mestre irineu alto santo',date:'1930s · Rio Branco community formation',note:'This is the formation of a particular religion, not the origin of Indigenous ayahuasca use. Alto Santo and later Santo Daime organisations have distinct histories; only the early Rio Branco setting is mapped.'}),
 r('uniao-do-vegetal','União do Vegetal',1961,'americas','religion',null,'Distinct Brazilian Amazonian religion','José Gabriel da Costa founds a religion with Christian and reincarnationist foundations, using hoasca in structured sessions devoted to moral and spiritual development.','Spiritual development|Reincarnation|Hoasca sessions','worldUdv',{approx:false,aliases:'uniao do vegetal união udv cebudv mestre gabriel',date:'1961 · foundation at Seringal Sunta',note:'Sunta was on the Bolivian side of the Acre border, not Porto Velho. This map begins with the documented Porto Velho organisational centre in 1965 and adds Brasília in 1982; it does not invent Sunta’s exact location or make UDV a Santo Daime offshoot.'}),
];

// Approximate geographic centres only. The octagons are display envelopes;
// radius and opacity have no quantitative historical or demographic meaning.
const setting=(x,y,dx=.48,dy=.36)=>[[x-dx,y],[x-dx*.7,y+dy*.7],[x,y+dy],[x+dx*.7,y+dy*.7],[x+dx,y],[x+dx*.7,y-dy*.7],[x,y-dy],[x-dx*.7,y-dy*.7]];
export const additionAreas={
 worldMenri:setting(89.538,29.446), // Treasury of Lives gives 29.446108, 89.537805.
 worldDolanji:setting(77.17,30.84), // Ligmincha: Menri at Dolanji, Himachal Pradesh.
 worldTiantai:setting(121.02,29.15), // SEP: Mount Tiantai and its surrounding teaching setting.
 worldChangan:setting(108.94,34.26), // SEP: Zhiyan returns to Chang’an in the late 640s.
 worldNara:setting(135.84,34.69), // Tōdai-ji official history and address: Nara, 752 consecration; active worship today.
 worldHiei:setting(135.84,35.07), // Enryakuji official history: Mount Hiei, Shiga.
 worldKyoto:setting(135.77,35.0), // Rinnou: Kenninji 1202; Hongwanji: Ōtani mausoleum 1272.
 worldHitachi:setting(140.1,36.35,.7,.5), // Hongwanji chronology: Hitachi/Kanto, 1214 onward.
 worldNagasaki:setting(129.88,32.75), // Manpukuji official history: Ingen’s arrival in Nagasaki.
 worldUji:setting(135.8,34.91), // Manpukuji official address, Uji.
 worldTokyo:setting(139.72,35.68), // Soka Gakkai: Tokyo institution; city-level setting only.
 worldYeonggwang:setting(126.45,35.3), // Park 2020: Sot’aesan’s Yeongsan setting, southwest Jeolla.
 worldIksan:setting(126.96,35.95), // Won official chronology: headquarters built 1924.
 worldTayNinh:setting(106.12,11.31), // Council: 1926 inauguration at Gò Kén, Tây Ninh.
 worldHoaHao:setting(105.35,10.59), // Hòa Hảo/Phú Mỹ, An Giang; not the entire Mekong Delta.
 worldTenri:setting(135.85,34.6), // Official headquarters: Mishima, Tenri, Nara.
 worldKonko:setting(133.62,34.54), // Official facts: Konko-chō, Asakuchi, Okayama.
 worldAyabe:setting(135.25,35.3), // Oomoto history: Nao’s community at Ayabe.
 worldGyeongju:setting(129.16,35.89), // AKS: Yongdamjeong, Gajeong-ri, Hyeongok-myeon.
 worldSalvador:setting(-38.5,-12.98), // Fundação Joaquim Nabuco: Casa Branca, Salvador.
 worldRio:setting(-43.2,-22.9,.65,.4), // Prandi 1998: Rio de Janeiro formation in the 1920s–1930s.
 worldHavana:setting(-82.37,23.11), // Brown: nineteenth-century Havana cabildos and house-temples.
 worldKingston:setting(-76.8,18.02), // UWI: Rastafari community studied in Kingston.
 worldRioBranco:setting(-67.81,-9.97), // Goulart 2019: Irineu’s community at Rio Branco, 1930s.
 worldPortoVelho:setting(-63.9,-8.76), // UDV: organisation in Porto Velho, January 1965.
 worldBrasilia:setting(-47.88,-15.79), // UDV: General Headquarters moves in 1982.
};

const local='Small schematic settings around named communities or institutions. Their size is not territory, dominance, membership or a measured rate of growth; they do not claim uninterrupted institutional activity.';
export const additionSpecs={
 bon:{patches:[['worldMenri',1405,1405],['worldDolanji',1967,1967]],place:'Menri in Namling; later the Dolanji community in Himachal Pradesh',note:local+' Menri is dated 1404 or 1405; its destruction and partial restoration do not mark the extinction of Bön. Dolanji’s 1967 settlement is a separate institutional milestone.'},
 tiantai:{patches:[['worldTiantai',580,580]],place:'Mount Tiantai teaching settings in Zhejiang',note:local+' c. 580 is a late-sixth-century scholarly horizon, not a precisely dated monastery opening.'},
 huayan:{patches:[['worldChangan',650,650,842,846],['worldNara',752,752]],place:'Tang-era Chang’an and Japanese Kegon reception at Tōdai-ji in Nara',context:true,note:local+' The Chang’an phase fades during the Tang suppression. The Nara setting represents continuing reception through Kegon, whose own entry remains separately selectable.'},
 kegon:{patches:[['worldNara',752,752]],place:'Tōdai-ji, the Kegon school’s head temple in Nara',note:local+' The 752 consecration locates a documented institutional milestone. Official temple sources describe continuing worship and rituals today; the setting therefore has no extinction date. The constant envelope does not imply unchanged buildings, administration or an uninterrupted institutional history.'},
 tendai:{patches:[['worldHiei',806,806]],place:'Enryakuji on Mount Hiei, near Kyoto and Ōtsu',note:local},
 rinzai:{patches:[['worldKyoto',1202,1202]],place:'Kenninji and the Kyoto setting of Japanese Rinzai Zen',note:local+' The 1191 transmission milestone precedes Kenninji’s 1202 foundation. Kyoto is one centre among many Rinzai lineages.'},
 'jodo-shu':{patches:[['worldKyoto',1175,1175]],place:'Hōnen’s Yoshimizu teaching setting in Kyoto',note:local},
 'jodo-shinshu':{patches:[['worldHitachi',1224,1224],['worldKyoto',1272,1272]],place:'Shinran’s Hitachi teaching setting and the later Ōtani community in Kyoto',note:local+' Shinran’s return to Kyoto does not end the Kanto community. The 1272 patch marks the mausoleum community, not the modern Nishi Hongwanji building or an already-divided denomination.'},
 obaku:{patches:[['worldNagasaki',1654,1654],['worldUji',1661,1661]],place:'Ingen’s arrival setting in Nagasaki; Manpukuji at Uji from 1661',note:local+' Nagasaki remains a lineage setting after Ingen establishes Manpukuji; the two patches are not a route or an estimate of religious spread.'},
 'soka-gakkai':{patches:[['worldTokyo',1930,1930]],place:'The Tokyo setting of Sōka Gakkai’s founding and institutional history',note:local+' This is a city-level historical setting, not a claim that the present Shinanomachi headquarters existed in 1930.'},
 'won-buddhism':{patches:[['worldYeonggwang',1916,1916],['worldIksan',1924,1924]],place:'Sot’aesan’s Yeonggwang setting and Iksan headquarters',note:local+' The separate Iksan date is the documented 1924 institutional milestone.'},
 'cao-dai':{patches:[['worldTayNinh',1926,1926]],place:'Gò Kén and the Tây Ninh institutional setting',note:local+' The current Holy See building postdates the 1926 inauguration; the patch represents the locality.'},
 'hoa-hao':{patches:[['worldHoaHao',1939,1939]],place:'Hòa Hảo village, now Phú Mỹ, in An Giang',note:local},
 tenrikyo:{patches:[['worldTenri',1838,1838]],place:'Jiba and the Tenri setting in Nara',note:local+' The present administrative city name is used to locate the earlier village setting.'},
 konkokyo:{patches:[['worldKonko',1859,1859]],place:'Konko-chō, present-day Asakuchi, Okayama',note:local},
 oomoto:{patches:[['worldAyabe',1892,1892]],place:'Nao Deguchi’s community at Ayabe, Kyoto Prefecture',note:local+' The site has experienced state suppression and rebuilding; a constant envelope is not a claim of unbroken institutional operation.'},
 'donghak-cheondogyo':{patches:[['worldGyeongju',1860,1860]],place:'Yongdamjeong near Gyeongju, the Donghak founding setting',note:local+' The location remains a historical origin setting after the Cheondogyo name is adopted; it is not the headquarters of every later organisation.'},
 candomble:{patches:[['worldSalvador',1830,1830]],place:'Casa Branca and selected Salvador terreiro settings',note:local+' The c. 1830 horizon is specific to Casa Branca’s documented history and does not date all Ketu, Jeje or Angola lineages.'},
 umbanda:{patches:[['worldRio',1920,1920]],place:'Rio de Janeiro communities in the formation of Umbanda',note:local+' 1920 locates an approximate 1920s–1930s institutional horizon; no precise universal founding date is claimed.'},
 lukumi:{patches:[['worldHavana',1850,1850]],place:'Nineteenth-century Havana cabildos and house-temple settings',note:local+' This is a mid-century navigation horizon within a longer process. Matanzas and other Cuban and diasporic centres are not exhaustively mapped.'},
 rastafari:{patches:[['worldKingston',1930,1930]],place:'Kingston and its Jamaican community setting',note:local+' The early 1930s are an emergence horizon; the coronation milestone in Ethiopia is not mapped as a Rastafari majority or political territory.'},
 'santo-daime':{patches:[['worldRioBranco',1930,1930]],place:'Raimundo Irineu Serra’s early community in Rio Branco, Acre',note:local+' Later Alto Santo and ICEFLU geographies require separate evidence and are not inferred from this patch.'},
 'uniao-do-vegetal':{patches:[['worldPortoVelho',1965,1965],['worldBrasilia',1982,1982]],place:'Porto Velho organisation from 1965; Brasília headquarters from 1982',note:local+' The 1961 foundation occurred at Seringal Sunta in Bolivia. Its exact location is left unmapped here rather than assigned to Porto Velho.'},
};

// These are catalogue groupings, not parentage. Bön is deliberately separate
// from Buddhism. Multi-origin religions have no invented single-parent edge.
export const additionFamilies={
 buddhist:['tiantai','huayan','kegon','tendai','rinzai','jodo-shu','jodo-shinshu','obaku','soka-gakkai','won-buddhism','hoa-hao'],
 east:['tenrikyo','konkokyo','oomoto','donghak-cheondogyo'],
 'african-american':['candomble','umbanda','lukumi','rastafari','santo-daime','uniao-do-vegetal'],
 other:['bon','cao-dai'],
};

// Additional evidence is explicit and surfaced by the sidebar alongside each
// primary reading. Institutional origin claims are attributed in the records.
const recordReferences={
 kegon:['worldHuayan','worldKegonSchool','worldKegonTeaching'],
 'jodo-shinshu':['worldShinTeaching'],
 'soka-gakkai':['worldMakiguchi'],
 konkokyo:['worldKonkoTeaching'],
 candomble:['worldCandombleNacoes'],
 rastafari:['worldRastafariPractice'],
 'santo-daime':['worldDaimePractice'],
 'uniao-do-vegetal':['worldUdvOrigin'],
};
for(const record of additionRecords)if(recordReferences[record.id])record.sourceRefs=recordReferences[record.id];
const settingReferences={
 huayan:['worldKegonHistory','worldKegonSchool','worldKegonTeaching'],
 bon:['worldMenri','worldBonDolanji','worldBonDolanjiHistory'],
 kegon:['worldKegonHistory','worldKegonSchool'],
 'jodo-shinshu':['worldShin'],
 'soka-gakkai':['worldMakiguchi'],
 'won-buddhism':['worldWonHistory'],
 'cao-dai':['worldCaodaiInauguration'],
 'hoa-hao':['worldHoaHaoPlace'],
 candomble:['worldCasaBranca'],
 'uniao-do-vegetal':['worldUdv','worldUdvOrigin'],
};
for(const [id,refs] of Object.entries(settingReferences))additionSpecs[id].sourceRefs=refs;
