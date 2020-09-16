const mongoose = require('mongoose');
const Note = require('./models/Note');
const Notebook = require('./models/Notebook');
const User = require('./models/User');

require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("MongoDB successfully connected");
        await Notebook.deleteMany();
        await User.deleteMany();
        await Note.deleteMany();

        let user = await User.create({ name: "Arthur Song", username: "arth3rs0ng", mediumId: "1a6c3e5d0b22af43ac7fb008fcc058726aef856ec7a0e3f546001e9d4eb71c658" });
        
        let nb1 = await Notebook.create({ name: "First Notebook", owner: user._id });

        let n1 = await Note.create({ 
            title: "Vices dum tela horruit per nostri fossae", 
            content: "# Vices dum tela horruit per nostri fossae\n\n## Perstant hostes\n\nLorem markdownum capit animal videt: apro **quoque**, Cercopum praedator. Auditi\nnostrum, cultos, neve [sed](http://etpeperisse.net/), numero fratres; et\n[veri](http://scitis.net/) contendere viderat ponit.\n\n**Vaccae anni quibusque** quisquis? Corpora coetu quo profundi stamine. Fuit\nodere squamas fatisque silicem latratu, que satis fama, inpulsos!\n\n\\\nVaminos lEt’s go.",
            owner: user._id,
            notebook: nb1._id
        })

        let n2 = await Note.create({
            title: "Iuno et viveret Dixerat non Minoa",
            content: "# Iuno et viveret Dixerat non Minoa\n\n## Et praeferre qui\n\nLorem markdownum *indiciumque limite* numen summa, cum haut, montibus in. Fibras\npotitur dat. Tuos **scis** sede, et omnia et puto est, ducis ego primis? Fuit\nCipus ferit, non tamen pererrant telique consurgere alios, curvamine gratamque\nnitidaeque omnis, ad nam crepuitque. Iason super prohibebar tyranno Lapitheia\nterritus quod *pavetque ait ritusque* sono quid, sui **amans**.",
            owner: user._id,
            notebook: nb1._id
        })

        let n3 = await Note.create({
            title: "Nepotes vertice et dea tumulum da rosaria",
            content: "# Nepotes vertice et dea tumulum da rosaria\n\n## Cyanee per posset Phoebus obortae te tamen\n\nLorem markdownum spernit! Ne visa ducebat deducere; est morte quaesita\ncrepitantis ab interea herboso. Optima inter deus harpen hoc repressit rigidis!\nCocalus secuta byblis clamantia portus. Est se praetenta parentes et rursus\naequore Perseus!",
            owner: user._id,
            notebook: nb1._id
        })

        nb1.notes.push(n1._id, n2._id, n3._id);
        await nb1.save();

        let nb2 = await Notebook.create({ name: "Programming", owner: user._id });

        let n4 = await Note.create({ 
            title: "Auctorem Anius mittentis conluerant", 
            content: "# Auctorem Anius mittentis conluerant\n\n## Turba in anus cingentibus in rapta manet\n\nLorem *markdownum* ait ingenium, iubasque premebat per, per *altera suspiria*\ncorde sede gravem si. [Da et](http://genitalia.com/erit.php) moveri saxum,\nbracchia sua usus [dignos umbra](http://siccoque-suo.org/fuit) petentem Hodites\nputes.\n\n## Lacte colle\n\nPopulorum lacertis curru, in candore Phaethon sceleris [vivunt\nquotiensque](http://turnus.com/) necem favore et urnis peregrina [ignotum ita\nnondum](http://attollo-saevior.io/perphaethon.html) parantem perque. Auras\nparitura sidere facta est.\n\nPectore Bybli viaque sollertia iuvenem patrios. Arserunt primaque suoque; celer\ncum ament tenebat argumenta cutem. Spectata sceleri utque. Palearia igitur,\nnatant si umbrae poena carinae una fertur sacros. [Rupta urbe\ntum](http://urbe.org/) etiamnum capellae exire tamen: dixit non navem matris.\n\n## Carpitur in omnia tuens terrae sola fugat\n\nSacer utero datis, arsit silet [tamen talia\ninficit](http://satussit.org/disponunt.html), fata.\n[Dolet](http://quos.org/pennisfores) sed floresque dum quos illos? Nam et soceri\nsimul colla, [atra fuerat](http://www.movet-habuit.org/nec-more) legem hoc\n**Cenaeo volatu** designat puppibus cunctatusque armo agendo. Se gradus\n**sternit**",
            owner: user._id,
            notebook: nb2._id
        })

        let n5 = await Note.create({
            title: "Aspergine femori",
            content: "# Aspergine femori\n\n## Ubi hospita dedisse sustinet et quam\n\nLorem markdownum caelo, moenia duo taedia: quam satiatur quoque patre contingat\npararet quique procellae habuere auras pudori. Petentem qua sed tanto *finire*,\ndebilitaturum iubet; hanc effigiem voces. Non lenius querellis *in borean\ntritumque* hiemem in ipse ausus tanta reservant. Habebam quod, cum veteres\ncongestos vis, **aera frequentant** dedi; et. Pegason aconita amaris; aere gyrum\nnoctis rumoribus dixit albentibus poena corpora atque.\n\n> Manibus victor, percussit subdita: terram primosque valens premit si. Ultimus\n> Sperchionidenque et ferenda mero quarum epulas frenisque toto nescio.\n\n## Vos cadit temptatum dixit scribit servatum revocamina\n\nUbi femina amorem tibi latratus nunc miseris Aurorae, ut cunctis Dictys\nfrustraque me mutua puto functa quid duasque mavult! Nisi passis, tot *addidit*\nliber ambiguus lacrimis spectabere sive cum? Tremulis poterat, quod simul et\ndicta resistere de pastor ad. Potitur perque torta manantem tecta regna tanto\nverso fratrem, esse.\n\nFinierat geminata plagarum nigri verterit regis, quid de occursu, cornu, causa,\nexhibuit. Parte nomen. Nunc et forte, [videtur](http://fusileet.com/subdita)\nIovis: atque move male flamma, est vacca; leve.\n\n## Sic iuvenis plectrumque medio medullas haerentia locus\n\nAliae eras libratus: deae suo laqueosque cepisse inter figis ubi orbes **ore\ntanta**, ter. Exigit laticemque auctor. Sola quaerit, maxima Sabina utque: *in\ngenitor* faece [meumque](http://invidiamtonitrus.org/augerem-ocyroen). Hic causa\nrepetens.",
            owner: user._id,
            notebook: nb2._id
        })

        let n6 = await Note.create({
            title: "Commota munera",
            content: "# Commota munera\n\n## Formam et tamen ursos nova\n\nLorem markdownum, nunc colla; tota est feretur litus; non. Gaudere huic. Non\nponti **tamen erat latentia** animo litore tenebrasque campi, vota maritum quae.\nEtiam latet prius saevit matris et pater candidus **nomen alium** altera cera.\nNequiquam praesens est *si* aperto peremi.\n\n> Partes ignibus cultro; [veteres](http://temptat-moenibus.net/matrisque.php)\n> fit potentior nostrum flenda meruisse timidis signa. Tumidis Somnia deseruit\n> indice paruerant quoniam tonitrus unda, modo, me Hospitis tumidum.\n\n## Vita at avito agebatur Acastus\n\nCorpus undas: inque est. Animalia iugalia patiere esset, iam nec pecudesque\ntamen celatur. Ista festa ubi nupta tela, inmensa in [mollit\numor](http://macies-et.org/me.html). Triones **Castrumque herbae** ossibus,\n**lactantiaque ferae** manu, fertilitatis aquis. Si cunctis redeo aderat;\nrepleam tum **vidisse emisit est** at tollens moturaque indicium aquarum.\n\n## Populi Pygmalion\n\nProles stagno nostri se inque dextera agmen tenet satis *laesi* placet. Tauri\niactat, Erymanthidas ipsos quod: sint coiere pectore aequor! Cortice retractat\ncommonuit in **transitque** macies expers exclamo omnia diversa ferinos.\n\n1. Incubat gratia agris vestigia\n2. De abeunt necem\n3. Nec sentite\n\n## Positis memini intereat indignata ferrum uterum Phoebus\n\nIamque hic durat praesentia concursibus Lyciamque modo Mutinae paciscor aeterna\ndonec contegat gaudia, Phoebus sunt. Nam eunt ut per, dat monstro deos probat te\ndei aequo ipse esset miserande cognita. Dictis Daphne licet illa excute corpus\nlitore serpentibus tamen Baccheaque mox aevum tardaque admovitque sibi;\nPeleusque sputantem gente infelix.",
            owner: user._id,
            notebook: nb2._id
        })

        nb2.notes.push(n4._id, n5._id, n6._id);
        await nb2.save();

        let nb3 = await Notebook.create({ name: "Improving Communication", owner: user._id });

        let n7 = await Note.create({ 
            title: "Ad vocatos evicere sua interea navita", 
            content: "# Ad vocatos evicere sua interea navita\n\n## Pes at dapes Indigetem leves nec iam\n\nLorem markdownum sentit volubilitas genitor vellem, generosaque gentes dextram.\nSed ut quoque concipis recens, est Cadmeida turgida, mihi deae tecum fraternis\nhuic feruntur vario.\n\n- Vina dumque modo poterit\n- Conditor iuvencae edita perdiderant ut aliter silvas\n- Tuae lupus transit\n- Caelo a capillos gemina\n- Tenus Eryx maiora\n\n## Quamquam ergo captum inposuit Palaestini infecit\n\nVos volentes primus transire; ferarum vos obliquo tuetur, cur. Vivaque lacertos\nquorum rapit aberat detestatur saepe plectrumque ipsa pater.\n\n> Gruem inbelle insula felicissima vestigia vultus sacer: *mota*, quid ego\n> corripiunt ablatus. [Vaccam mundi](http://sustinet.net/nemus.html), in ecce\n> videretur monstris Paridis nudo; vera et repugnas omnem sic egredior, est\n> **ubi**.\n\n## Foedo tamen\n\nIste aut fama mandata *licere Cyanee* cornua quicquid [contagia\nferar](http://autvulneris.com/cunctantemurna) pectore. Sacrum poenas, vivus\ndextro. Ventris incessit, flectere sacerdotis solet, est disiectisque talibus.\nSine citius et haec, saepe temeraria et equo convertor occasus onerosus iaceret\naustri labori Periclymeni miserum.\n\n## Rutuli relinquit fovebam\n\nPro busta sub: qui iuvenis. Fuga veros adhaeret verum nam, nec est erroribus\nulterius Circen [Parthenopen](http://vino-murum.org/signorum-ille.html), totidem\nveras ubi decor? Ruit novem amicius operisque es per et postponere superi\navellit Pleuronius mutare sideraque recentes; venite sanguine. Ab unde ossa\nPersidaque Helles ensem quam nec erigitur et tantum, ipse Fama diu talia, sint.\nLevem a ausus dubium, recessu alter scelerataque Aeolidae non tria revelli.\n\n> Gelidumque quibus erunt Delum callida telum. Potentem et iamdudum trahit\n> nitidaque ut *currus sanguine* maxima. Rigidis quo, sceptra anhelo Pentheus,\n> errare cur nec stet exercent Achilles tecto. Illis esse tantaque terrore hoc\n> trunci conspexit Etruscam repugnat loci paruerit, templa avem posses.",
            owner: user._id,
            notebook: nb3._id
        })

        let n8 = await Note.create({
            title: "Nam Haec resolutis divulsaque namque Ampycides fieri",
            content: "# Nam Haec resolutis divulsaque namque Ampycides fieri\n\n## Relictas et petite\n\nLorem markdownum **polumque** videt! Ignes vires et vindice hic fungi **ipsa\npomoque vela**. Sub dum ventos longius tempora et quae qui, averso vis\n[Latonia](http://www.isque-qui.org/acquam). Loquenti haec sunt ab sola satiaque\nvulnus terram mihi desine de neque *curvamine* fera: poterat. Est auferat rima\nvirginitatis adulterium vagantur sorores, dixit pactae ardua tremit; domui, est\norbis, tormenta.\n\n1. Venerande in fortis si fasque Arcades te\n2. Sacras manu\n3. Vi aristas moenia aliis in poterant viderunt\n4. Grator raucis petuntur de nullo Hymen vires\n5. Legeret Iapygis peremptum\n\nPrecor novemque nec facto; credant ignotum, facesque ossa silvas? Ullum Hector\nquater arduus [exiguis](http://ne.io/habenasrecumbit.aspx), decoris concipit\nparte non, Priamo?\n\n## Sanguine laverat qua edidit tecumque cum aurumque\n\nIn clade si misso si ramis quo honore nescis solebat, nympha totum in terga\nteneraque sperando. Auro Nestor, sua hos sparserat ancipitesque namque vultus\nTrachinius proturbat novum non triumphi nectare et croceo tumulumque vitam:\nevinctus.\n\n- Abstulit ingenti domus iuvenes Iunone\n- Ferro nunc carpebat tangere meliora\n- Esse etsi admovet et virgine altrici\n- Hederae tellus munusque corpore molles\n\n## Illam corpora\n\nFugam bacis moriens ducentem, orantem longa mori circumlitus quos nec lacrimis,\nsude [cortice](http://saepe.io/aeetaet) velaque. Nullum ventos corpore et\nresumpta discrimen iuvenis et abest mixtae et agantur causa.\n\n1. Excipit inde\n2. Mirabere quae an sermonibus tota instabat superum\n3. Qui esset places spatio cum vinco pater\n4. Miserum pellis lenta ille protinus non talia\n5. Quae lacertis semine famuli\n\nSacerdos corpore dolores nec essemus patria id insultavere tegit et Dictys\nunguibus crescendo pertimuit **ducentem**. Silentia lymphis, saepe vox levi\ndedit dicta, adsim eurus [cum qualis](http://misit.org/felicesque) retices\nsucos: foedera. Truncas necem cunctis aequorea superi, rima classe. Ut Nerea\n**Olympus populos** patrium, [est](http://collabitur.com/anxius) utque inducere\n**stillabant et** etiam!",
            owner: user._id,
            notebook: nb3._id
        })

        let n9 = await Note.create({
            title: "Obstitit aetas pollens Ixionis pullo",
            content: "# Obstitit aetas pollens Ixionis pullo\n\n## Eo stagni pronam genus\n\nLorem markdownum aura custodia natura, falsa villosa poterat: solacia Finierat\ndedisti et sociis vidit: aetas est, et. Vos Marathon rabiem. Longa caeli aratro\nubi poena natura nulli fugias volucrisque praepes palearia Sisyphon [concordia\nmitem](http://www.quem.com/) idque Achilles fraudesque, exsultantemque. Palmis\niter comae, et novis factum latentem falsaque molis. Voce nec expalluit medios\nreducere in lino ingenium verbenis inmittam disiecit.\n\n    irc(54 + encryptionPageThroughput, scrapingDebugMaster *\n            motherboardBatchSource(programming), yahoo_format_antivirus);\n    pci(animatedRegistry);\n    var tftp = ibm_wavelength;\n\n## Imo murmure una mea Hypsipyles huius ait\n\nAdest pinus, praesignis versatus herbae in umbrae ipse tenuit petere virga\nexcelsa. O iussus est, humo nova esse, et vestris; in esset et coniugium accipe\noscula.\n\nPostquam oscula terra domique quia habebat tenuisse tantum, parentem muneris,\namans Deoida exit illa. Ostendens aether; gelida neque cortice vestrumque,\nbacchantum spinae, iacebat non corona. Medios hoc redeunt antris?\n\n## Matri Ceyx elisa inter\n\nConiunx auro utile. Illis voce verba animus?\n\n## Cura virgo socer meas nivibus inania causae\n\nElige albas: arte quem ora, **suo** Haec erigor vecte quae flammas cives\nremissis supplex corpore, deus. Sive satis motus regina: tura coniunx sospite\nincubuit agendum, tumidum quo mea munus timore. Scorpius quamquam irata.\n\nSua aquae prius venandi induruit Phoebeamque videbat corneaque: alvo inpune\nsuppressa adfuit quamvis vates septem spectantur precibus mirumque, hanc. Non\nnisi frequentat plures veri ratem boum flamma alta? Nam *dum profuga iuvit* quam\ntumens luctantemque inquinat Lucifero et illa superi fuerat cum cuncti, Aphidas.",
            owner: user._id,
            notebook: nb3._id
        })

        nb3.notes.push(n7._id, n8._id, n9._id);
        await nb3.save();

        user.notebooks.push(nb1._id, nb2._id, nb3._id);
        await user.save();

        console.log("Seeding finished");
        process.exit();
    })
    .catch(err => console.log(err));