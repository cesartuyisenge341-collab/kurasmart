/**
 * KuraSmart lesson catalogue — 50+ lessons across 6 domains, 0–72 months.
 * Each lesson has full content in English, Français, and Kinyarwanda.
 *
 * Fields per lesson:
 *   id, minM, maxM        — age range in months
 *   domain                — Language | Motor | Cognitive | Social | Music | Nature
 *   icon                  — emoji
 *   durationMin           — suggested duration
 *   materials             — list of things needed (in each language)
 *   title / desc / steps  — per language { en, fr, rw }
 */

export const LESSONS = [

  // ════════════════════════════════════════════════════════
  //  0 – 3  months
  // ════════════════════════════════════════════════════════

  {
    id: 'L001', minM: 0, maxM: 4, domain: 'Music', icon: '🎵', durationMin: 10,
    materials: { en: [], fr: [], rw: [] },
    title:  { en: 'Lullaby Time',           fr: 'Comptines Douces',          rw: 'Indirimbo z\'Amasepfu' },
    desc:   {
      en: 'Sing slow, gentle songs to your baby. Repeating the same melodies every day helps babies recognize voices, feel safe, and develop early language patterns.',
      fr: 'Chantez des chansons douces et lentes à votre bébé. Répéter les mêmes mélodies aide les bébés à reconnaître les voix et à développer le langage.',
      rw: 'Bina indirimbo nziza kandi zisubiramo ku mwana wawe. Gusubiramo indirimbo imwe buri munsi bifasha umwana kumenya ijwi ry\'umubyeyi no gutuza.',
    },
    steps: {
      en: ['Hold baby close against your chest', 'Choose a simple, slow melody', 'Sing softly 2–3 times', 'Pause and let baby respond', 'Repeat the same song every day at the same time'],
      fr: ['Tenez bébé près de votre poitrine', 'Choisissez une mélodie simple et lente', 'Chantez doucement 2–3 fois', 'Faites une pause et laissez bébé répondre', 'Répétez la même chanson chaque jour à la même heure'],
      rw: ['Fata umwana hafi y\'igituza cyawe', 'Hitamo indirimbo yoroheje', 'Bina buhoro inshuro 2-3', 'Hagarara uze umwana asubize', 'Subiramo indirimbo imwe buri munsi ku gihe kimwe'],
    },
  },

  {
    id: 'L002', minM: 0, maxM: 4, domain: 'Cognitive', icon: '👁️', durationMin: 8,
    materials: { en: ['High-contrast cards (black & white)'], fr: ['Cartes noir et blanc'], rw: ['Ibikapu byera n\'bibisi'] },
    title:  { en: 'Look & Focus',              fr: 'Regarder & Concentrer',    rw: 'Reba & Witondere' },
    desc:   {
      en: 'Newborns see best at 20–30 cm. High-contrast black and white images help develop the visual cortex and train the eyes to track movement.',
      fr: 'Les nouveau-nés voient mieux à 20–30 cm. Les images en noir et blanc aident à développer le cortex visuel.',
      rw: 'Impinja zirabona neza ku cm 20-30. Amashusho y\'ibara ryera n\'ibisi afasha iterambere ry\'ijisho.',
    },
    steps: {
      en: ['Hold a black-and-white card 25 cm from baby\'s face', 'Move it slowly left then right', 'Watch baby\'s eyes track the card', 'Try a simple face drawing next', 'Keep sessions under 10 minutes'],
      fr: ['Tenez une carte noir et blanc à 25 cm', 'Bougez-la lentement gauche puis droite', 'Observez les yeux de bébé suivre la carte', 'Essayez ensuite un dessin de visage simple', 'Gardez les sessions sous 10 minutes'],
      rw: ['Fata ikapu ry\'ibara ryera n\'ibisi ku cm 25', 'Ifuza buhoro ibumoso hanyuma iburyo', 'Reba amaso y\'umwana akurikira ikapu', 'Gerageza ishusho y\'amaso', 'Komeza ibikorwa munsi y\'iminota 10'],
    },
  },

  {
    id: 'L003', minM: 0, maxM: 4, domain: 'Social', icon: '🤱', durationMin: 15,
    materials: { en: [], fr: [], rw: [] },
    title:  { en: 'Skin-to-Skin Bonding',      fr: 'Peau à Peau',              rw: 'Guturana Uruhu' },
    desc:   {
      en: 'Skin-to-skin contact regulates baby\'s heartbeat, temperature, and stress hormones. It strengthens the attachment bond between parent and child.',
      fr: 'Le contact peau à peau régule le rythme cardiaque, la température et les hormones du stress de bébé.',
      rw: 'Guturana uruhu bigabanya agahinda k\'umwana kandi bikomeza imishyikirano y\'umubyeyi n\'umwana.',
    },
    steps: {
      en: ['Remove baby\'s clothing except diaper', 'Place baby chest-to-chest on your bare skin', 'Cover both with a warm blanket', 'Talk or hum gently', 'Stay still for at least 15 minutes'],
      fr: ['Enlevez les vêtements de bébé sauf la couche', 'Placez bébé poitrine contre poitrine sur votre peau', 'Couvrez-vous d\'une couverture chaude', 'Parlez ou fredonnez doucement', 'Restez immobile au moins 15 minutes'],
      rw: ['Ambura umwana impuzu zose uretse impamba', 'Shyira umwana ku gituza cyawe', 'Bwirikira ikoti y\'ubushyuhe', 'Vugana cyangwa uvume buhoro', 'Komeza nibura iminota 15'],
    },
  },

  {
    id: 'L004', minM: 0, maxM: 4, domain: 'Language', icon: '💬', durationMin: 10,
    materials: { en: [], fr: [], rw: [] },
    title:  { en: 'Face-to-Face Talk',         fr: 'Dialogue Visage à Visage', rw: 'Kuvugana Imbere' },
    desc:   {
      en: 'Babies respond to faces from day one. Making eye contact and talking — even when baby can\'t reply — wires the brain for conversation and trust.',
      fr: 'Les bébés répondent aux visages dès le premier jour. Le contact visuel et la parole câblent le cerveau pour la conversation.',
      rw: 'Impinja zishishikarira ibibari kuva umunsi wa mbere. Kuvugana no kureba mu maso bigana ubwonko bw\'ururimi.',
    },
    steps: {
      en: ['Get down to baby\'s level', 'Make gentle eye contact and smile', 'Say baby\'s name slowly', 'Pause and wait for a reaction (a wiggle, coo, or gaze)', 'Respond to whatever baby does', 'Repeat with simple words and varied expressions'],
      fr: ['Descendez au niveau de bébé', 'Établissez un contact visuel doux et souriez', 'Prononcez lentement le nom de bébé', 'Faites une pause et attendez une réaction', 'Répondez à ce que fait bébé', 'Répétez avec des mots simples'],
      rw: ['Nijuka ku rwego rw\'umwana', 'Murebe mu maso buhoro useka', 'Vuga izina ry\'umwana buhoro', 'Hagarara utege igisubizo', 'Subiza icyo umwana akoze', 'Subiramo n\'amagambo yoroheje'],
    },
  },

  // ════════════════════════════════════════════════════════
  //  3 – 6  months
  // ════════════════════════════════════════════════════════

  {
    id: 'L005', minM: 3, maxM: 7, domain: 'Motor', icon: '🏋️', durationMin: 10,
    materials: { en: ['Firm flat surface', 'Rolled towel (optional)'], fr: ['Surface plane ferme', 'Serviette roulée (optionnel)'], rw: ['Ahantu hateye', 'Ubwoya bwarunze (ntabwo ngombwa)'] },
    title:  { en: 'Tummy Time',               fr: 'Temps sur le Ventre',      rw: 'Kuryamira ku Nda' },
    desc:   {
      en: 'Tummy time builds the muscles of the neck, shoulders and core that babies need to roll, sit and crawl. Start with 2 minutes and increase daily.',
      fr: 'Le temps sur le ventre renforce les muscles du cou, des épaules et du tronc nécessaires pour rouler, s\'asseoir et ramper.',
      rw: 'Kuryamira ku nda gukomeza imitsi y\'izosi, ibitugu n\'inda bizafasha umwana kuzenguruka no guturuka.',
    },
    steps: {
      en: ['Place baby on a firm surface on their tummy', 'Get in front of baby at eye level', 'Use a rattle or toy to encourage lifting the head', 'Celebrate every attempt with smiles', 'Do 2–5 minutes, 3–5 times daily', 'Never leave baby unattended during tummy time'],
      fr: ['Placez bébé sur une surface ferme sur le ventre', 'Mettez-vous devant bébé au niveau des yeux', 'Utilisez un hochet pour encourager à lever la tête', 'Célébrez chaque effort avec des sourires', 'Faites 2–5 minutes, 3–5 fois par jour', 'Ne laissez jamais bébé sans surveillance'],
      rw: ['Ryamisha umwana ku nda ahantu hateye', 'Ijuka imbere y\'umwana ku rwego rw\'amaso', 'Koresha inzuguzugu kugirango umwana akure umutwe', 'Ishima imizi yose n\'iseka', 'Kora iminota 2-5, inshuro 3-5 ku munsi', 'Ntukize umwana atagenzwa'],
    },
  },

  {
    id: 'L006', minM: 3, maxM: 7, domain: 'Motor', icon: '🪆', durationMin: 10,
    materials: { en: ['Soft rattle', 'Colourful toy'], fr: ['Hochet doux', 'Jouet coloré'], rw: ['Inzuguzugu nziza', 'Ikintu cy\'amabara'] },
    title:  { en: 'Reach & Grasp',            fr: 'Attraper & Saisir',        rw: 'Gukamura & Gufata' },
    desc:   {
      en: 'Between 3–6 months babies start reaching for objects. Encouraging this refines hand-eye coordination and builds the foundation for all future motor skills.',
      fr: 'Entre 3 et 6 mois, les bébés commencent à saisir des objets. Cela affine la coordination main-œil.',
      rw: 'Hagati y\'amezi 3-6 impinja zitangira gukamura ibintu. Ibi bikomeza ubudasa bw\'intoki n\'amaso.',
    },
    steps: {
      en: ['Hold a bright rattle 20 cm in front of baby', 'Shake it gently to attract attention', 'Move it slowly toward baby\'s hands', 'Let baby grab it', 'Gently pull it away and repeat', 'Praise every successful grasp'],
      fr: ['Tenez un hochet brillant à 20 cm devant bébé', 'Agitez-le doucement pour attirer l\'attention', 'Déplacez-le lentement vers les mains de bébé', 'Laissez bébé l\'attraper', 'Retirez-le doucement et répétez', 'Louez chaque prise réussie'],
      rw: ['Fata inzuguzugu ifite amabara ku cm 20 imbere y\'umwana', 'Yihinduza buhoro kugirango umwana ayitondere', 'Yisunikira buhoro ku ntoki z\'umwana', 'Reka umwana ayifate', 'Yisubire buhoro ukasubiramo', 'Ishima buri gufata neza'],
    },
  },

  {
    id: 'L007', minM: 3, maxM: 7, domain: 'Language', icon: '🔤', durationMin: 10,
    materials: { en: [], fr: [], rw: [] },
    title:  { en: 'Babble Back',              fr: 'Imiter les Babillages',    rw: 'Gusubira Inzika' },
    desc:   {
      en: 'When you imitate a baby\'s babble sounds, you teach them turn-taking — the foundation of conversation. Babies who are babbled back to develop language faster.',
      fr: 'Quand vous imitez les babillages, vous enseignez les tours de parole — base de la conversation.',
      rw: 'Gusubira inzika z\'umwana kumwigisha gusakuza — intango y\'ikiganiro. Abana b\'ibisubizo biga ururimi vuba.',
    },
    steps: {
      en: ['Wait for baby to make a sound', 'Repeat the exact sound back', 'Pause and wait for baby\'s next sound', 'Mimic it again', 'Gradually introduce a new sound and see if baby copies you', 'Keep sessions light and fun'],
      fr: ['Attendez que bébé fasse un son', 'Répétez exactement le même son', 'Faites une pause et attendez le prochain son', 'Imitez-le à nouveau', 'Introduisez progressivement un nouveau son', 'Gardez les sessions légères et amusantes'],
      rw: ['Tegereza umwana akore ijwi', 'Subiramo ijwi nk\'iry\'umwana', 'Hagarara utegereze ijwi rikurikira', 'Subiramo', 'Nganira ijwi rishya urebe niba umwana akigana', 'Komeza ibikorwa bihuye no guseka'],
    },
  },

  {
    id: 'L008', minM: 3, maxM: 7, domain: 'Social', icon: '🪞', durationMin: 8,
    materials: { en: ['Unbreakable mirror'], fr: ['Miroir incassable'], rw: ['Inzuzi itasuka'] },
    title:  { en: 'Mirror Discovery',         fr: 'Découverte du Miroir',     rw: 'Kumenya Inzuzi' },
    desc:   {
      en: 'Babies are fascinated by the face in the mirror. This activity builds self-awareness, emotional recognition and social curiosity.',
      fr: 'Les bébés sont fascinés par le visage dans le miroir. Cela construit la conscience de soi et la curiosité sociale.',
      rw: 'Impinja zishimishwa n\'ibibari mu nzuzi. Ibi birimo gutuza, kumenya ibyiyumvo, no gushishikarirwa n\'abandi.',
    },
    steps: {
      en: ['Hold baby in front of a safe mirror', 'Point to baby\'s reflection: "That\'s you!"', 'Make faces — smile, pout, surprise', 'Point to eyes, nose, mouth in the reflection', 'Let baby touch the mirror', 'Name what you see: "I see your big eyes!"'],
      fr: ['Tenez bébé devant un miroir sûr', 'Montrez le reflet: "C\'est toi !"', 'Faites des grimaces — sourire, moue, surprise', 'Montrez yeux, nez, bouche dans le reflet', 'Laissez bébé toucher le miroir', 'Nommez ce que vous voyez'],
      rw: ['Fata umwana imbere y\'inzuzi', 'Reba ishusho ye: "Ni we!"', 'Kora amaso aseka, agaragaze', 'Reba amaso, nzuzu, akanwa mu nzuzi', 'Reka umwana akoreko', 'Vuga ibyo ubona: "Mbona amaso yawe mainshi!"'],
    },
  },

  {
    id: 'L009', minM: 3, maxM: 7, domain: 'Music', icon: '🎶', durationMin: 10,
    materials: { en: [], fr: [], rw: [] },
    title:  { en: 'Clap & Bounce',            fr: 'Frapper & Rebondir',       rw: 'Kufyina & Guturika' },
    desc:   {
      en: 'Rhythmic movement activates the cerebellum and builds a foundation for music, math and coordination. Simple bouncing on a knee is a full-body learning experience.',
      fr: 'Le mouvement rythmique active le cervelet et construit les bases pour la musique, les mathématiques et la coordination.',
      rw: 'Guturika ku mahano bifasha ubwonko no kwiga indirimbo n\'imibare.',
    },
    steps: {
      en: ['Sit baby on your knee facing you', 'Bounce gently to a steady beat while singing', 'Clap baby\'s hands together gently on the beat', 'Increase pace slowly, then slow down again', 'End with a gentle rock'],
      fr: ['Asseyez bébé sur votre genou face à vous', 'Rebondissez doucement en chantant', 'Frappez doucement les mains de bébé sur le rythme', 'Accélérez lentement, puis ralentissez', 'Terminez par un balancement doux'],
      rw: ['Icaza umwana ku hitamu rwawe akuragarije', 'Mwiturike buhoro urimbira', 'Fatanya intoki z\'umwana mu gitondo', 'Yongera buhoro, hanyuma udondore', 'Rangiza n\'iguturika buhoro'],
    },
  },

  // ════════════════════════════════════════════════════════
  //  6 – 12  months
  // ════════════════════════════════════════════════════════

  {
    id: 'L010', minM: 6, maxM: 12, domain: 'Language', icon: '📚', durationMin: 10,
    materials: { en: ['Board book'], fr: ['Livre cartonné'], rw: ['Igitabo cy\'imyifatire'] },
    title:  { en: 'Picture Book Talk',        fr: 'Lire en Images',           rw: 'Gusoma Amashusho' },
    desc:   {
      en: 'Point to pictures, name objects and ask simple questions. Even before babies talk, hearing words linked to images builds the vocabulary they will use later.',
      fr: 'Montrer les images, nommer les objets et poser des questions simples. Avant de parler, entendre des mots liés aux images construit le vocabulaire.',
      rw: 'Reba amashusho, vuga amazina y\'ibintu, ubaze ibibazo byoroheje. Mbere y\'uko umwana avuga, kumva amagambo ashingiye ku mashusho bibaka inzego z\'ururimi.',
    },
    steps: {
      en: ['Hold baby in your lap', 'Open the book slowly', 'Point to each picture: "Look! A dog!"', 'Wait for baby to look', 'Make the animal sound or action', 'Let baby touch and turn pages', 'Ask "Where is the cat?" and guide baby\'s hand'],
      fr: ['Tenez bébé sur vos genoux', 'Ouvrez le livre lentement', 'Montrez chaque image: "Regarde ! Un chien !"', 'Attendez que bébé regarde', 'Faites le son ou l\'action de l\'animal', 'Laissez bébé toucher et tourner les pages', 'Demandez "Où est le chat ?" et guidez la main de bébé'],
      rw: ['Icaza umwana ku mahano yawe', 'Fungura igitabo buhoro', 'Reba ishusho iza: "Reba! Imbwa!"', 'Tegereza umwana arebe', 'Kora ijwi ry\'inyamaswa', 'Reka umwana akoresho ahindurane urupapuro', 'Baza "Aho nyaho i"'],
    },
  },

  {
    id: 'L011', minM: 6, maxM: 12, domain: 'Cognitive', icon: '🫙', durationMin: 12,
    materials: { en: ['Container with lid', 'Small soft blocks'], fr: ['Contenant avec couvercle', 'Petits blocs mous'], rw: ['Ikabiti n\'igitiba', 'Ibintu bito byoroshye'] },
    title:  { en: 'In & Out',                 fr: 'Dedans & Dehors',          rw: 'Imbere & Hanze' },
    desc:   {
      en: 'Object permanence — understanding that things still exist when hidden — is one of the first cognitive milestones. Containers are perfect for exploring this.',
      fr: 'La permanence de l\'objet — comprendre que les choses existent même cachées — est l\'une des premières étapes cognitives.',
      rw: 'Gutunga ibintu mu mutwe — gusobanukirwa ko ibintu bikomeza kubaho igihe biheretswe — ni intambwe imwe mu iterambere ry\'ubwenge bw\'umwana.',
    },
    steps: {
      en: ['Show baby a block and drop it into a container', 'Look surprised: "Where did it go?"', 'Help baby look inside to find it', 'Let baby drop blocks in', 'Take the lid off and on while baby watches', 'Let baby dump all blocks out and repeat'],
      fr: ['Montrez un bloc à bébé et déposez-le dans le contenant', 'Sembler surpris: "Où est-il allé ?"', 'Aidez bébé à regarder à l\'intérieur', 'Laissez bébé mettre des blocs', 'Retirez et remettez le couvercle', 'Laissez bébé renverser tous les blocs'],
      rw: ['Erekana umwana indobi ukaridika mu kabiti', 'Garagaza gutegazwa: "Cyagiye hehe?"', 'Fasha umwana kureba imbere', 'Reka umwana afunge indobi', 'Fungura wugarike igitiba nk\'uko umwana areba', 'Reka umwana avunge indobi zose ukasubiramo'],
    },
  },

  {
    id: 'L012', minM: 6, maxM: 12, domain: 'Cognitive', icon: '🙈', durationMin: 8,
    materials: { en: [], fr: [], rw: [] },
    title:  { en: 'Peek-a-Boo',               fr: 'Coucou!',                  rw: 'Gukina Icara' },
    desc:   {
      en: 'Peek-a-boo teaches object permanence, anticipation, and cause-and-effect. Babies\' laughter during this game is linked to developing social bonds.',
      fr: 'Coucou enseigne la permanence de l\'objet, l\'anticipation et la cause à effet.',
      rw: 'Gukina Icara biga gutunga ibintu mu mutwe, gutekereza imberi, n\'impamvu n\'ingaruka.',
    },
    steps: {
      en: ['Cover your face with both hands', 'Pause 2 seconds', 'Uncover with "PEEK-A-BOO!"', 'Watch baby laugh', 'Cover again, this time with a cloth or blanket', 'Let baby pull the cloth off and find you', 'Let baby hide their own face and "find" themselves'],
      fr: ['Couvrez votre visage des deux mains', 'Faites une pause de 2 secondes', 'Découvrez avec "COUCOU !"', 'Observez le rire de bébé', 'Couvrez à nouveau avec un tissu', 'Laissez bébé tirer le tissu', 'Laissez bébé cacher son propre visage'],
      rw: ['Fata amaso yawe n\'intoki zombi', 'Hagarara amasegonda 2', 'Fungura uvuge "COUCOU!"', 'Reba umwana aseka', 'Fata ukafunika undi mwenda', 'Reka umwana akurure umwenda', 'Reka umwana afunike amaso ye agatemberera'],
    },
  },

  {
    id: 'L013', minM: 6, maxM: 12, domain: 'Motor', icon: '🏗️', durationMin: 10,
    materials: { en: ['4–6 large soft blocks'], fr: ['4–6 grands blocs mous'], rw: ['Indobi nini nini 4-6'] },
    title:  { en: 'Stack & Knock',            fr: 'Empiler & Renverser',      rw: 'Gushingikireza & Gusubiza' },
    desc:   {
      en: 'Stacking objects builds hand-eye coordination, focus, and cause-and-effect reasoning. The joy of knocking them over is half the lesson!',
      fr: 'Empiler construit la coordination main-œil et le raisonnement cause-effet. La joie de renverser fait partie de la leçon !',
      rw: 'Gushingireza ibintu bikomeza ubudasa bw\'intoki n\'amaso. Kwishimira gusubiza n\'igice cy\'isomo!',
    },
    steps: {
      en: ['Stack 2 blocks in front of baby', 'Show baby how to knock them down', 'Stack again and let baby do it', 'Build a taller tower each time', 'Count aloud as you stack: "One… two… three!"', 'Let baby pick blocks up and hand them to you'],
      fr: ['Empilez 2 blocs devant bébé', 'Montrez comment les renverser', 'Empilez à nouveau et laissez bébé le faire', 'Construisez une tour plus haute', 'Comptez à voix haute: "Un… deux… trois !"', 'Laissez bébé ramasser et vous les donner'],
      rw: ['Shibikira indobi 2 imbere y\'umwana', 'Erekana umwana ugusubiza', 'Subiramo ukamuha gusubiza', 'Yubaka inzu ndende buri gihe', 'Bara urashoje: "Rimwe… kabiri… gatatu!"', 'Reka umwana ahuze indobi akuhe'],
    },
  },

  {
    id: 'L014', minM: 6, maxM: 12, domain: 'Music', icon: '🥁', durationMin: 10,
    materials: { en: ['Plastic bowl', 'Wooden spoon'], fr: ['Bol en plastique', 'Cuillère en bois'], rw: ['Agati ka plastike', 'Ikijiko cy\'ikibabi'] },
    title:  { en: 'Baby Drumming',            fr: 'Tambour Bébé',             rw: 'Ingoma y\'Umwana' },
    desc:   {
      en: 'Drumming on simple objects teaches rhythm, force modulation and cause-and-effect. Babies love the immediate sound response from hitting things.',
      fr: 'Frapper des objets simples enseigne le rythme, la modulation de la force et la cause à effet.',
      rw: 'Gukubita ku bintu bigorora amashami, imbaraga, n\'impamvu n\'ingaruka.',
    },
    steps: {
      en: ['Place an upturned bowl in front of baby', 'Show baby how to tap with the spoon', 'Tap a simple beat', 'Help baby hold the spoon and tap together', 'Try different objects for different sounds', 'Sing along to your drumming rhythm'],
      fr: ['Placez un bol retourné devant bébé', 'Montrez comment taper avec la cuillère', 'Tapez un rythme simple', 'Aidez bébé à tenir la cuillère et taper ensemble', 'Essayez différents objets', 'Chantez au rythme de votre tambour'],
      rw: ['Fata agati k\'intoki imbere y\'umwana', 'Erekana umwana gukubita n\'ikijiko', 'Kubita inshingano yoroheje', 'Fasha umwana gufata ikijiko mukubite hamwe', 'Gerageza ibintu bitandukanye', 'Bina uguhuye n\'amashami'],
    },
  },

  // ════════════════════════════════════════════════════════
  //  12 – 24  months
  // ════════════════════════════════════════════════════════

  {
    id: 'L015', minM: 12, maxM: 24, domain: 'Language', icon: '🏷️', durationMin: 10,
    materials: { en: ['Household objects'], fr: ['Objets ménagers'], rw: ['Ibintu by\'mu rugo'] },
    title:  { en: 'Name Everything',          fr: 'Tout Nommer',              rw: 'Vuga Amazina Yose' },
    desc:   {
      en: 'Toddlers absorb vocabulary at an astonishing rate. Walking through the house naming everything — cup, chair, door — supercharges this process.',
      fr: 'Les tout-petits absorbent le vocabulaire à un rythme étonnant. Nommer tout dans la maison accélère ce processus.',
      rw: 'Abana bo mu ntangiriro babara amagambo mu buryo butangaje. Kuzenguruka inzu uyita amazina y\'ibintu byose bituma ibyo biterimbere.',
    },
    steps: {
      en: ['Walk slowly around one room', 'Touch each object and say its name clearly', 'Ask "What\'s this?" and wait', 'Give the word if baby doesn\'t respond', 'Repeat in the next room', 'Use the same words consistently every day'],
      fr: ['Marchez lentement dans une pièce', 'Touchez chaque objet et dites son nom clairement', 'Demandez "Qu\'est-ce que c\'est ?" et attendez', 'Donnez le mot si bébé ne répond pas', 'Répétez dans la pièce suivante', 'Utilisez les mêmes mots chaque jour'],
      rw: ['Genda buhoro mu cyumba kimwe', 'Kora kuri buri kintu uvuge izina ryacyo', 'Baza "Ni iki?" ugategereza', 'Tangaza ijambo niba umwana adasubiza', 'Subiramo mu cyumba gikurikira', 'Koresha amagambo amwe buri munsi'],
    },
  },

  {
    id: 'L016', minM: 12, maxM: 24, domain: 'Motor', icon: '🖍️', durationMin: 15,
    materials: { en: ['Thick crayons', 'Large paper'], fr: ['Gros crayons', 'Grand papier'], rw: ['Ikaramu nini', 'Urupapuro runini'] },
    title:  { en: 'First Scribbles',          fr: 'Premiers Gribouillis',     rw: 'Inyandiko za Mbere' },
    desc:   {
      en: 'Scribbling is the first step in writing. Toddlers learn grip, pressure and directionality. Any mark on paper is a success — celebrate every stroke.',
      fr: 'Gribouiller est la première étape de l\'écriture. Tout trait sur le papier est un succès — célébrez chaque coup de crayon.',
      rw: 'Gukora imyirondoro ni intambwe ya mbere mu kwandika. Ikimenyetso cyose ku rupapuro ni intsinzi — ishima buri nombo.',
    },
    steps: {
      en: ['Tape a large sheet of paper to the floor', 'Show how to hold a crayon (use a chunky one)', 'Make a big stroke and say "Look what I did!"', 'Hand it to baby and let them go', 'Name what you see: "That looks like a circle!"', 'Date and keep the artwork'],
      fr: ['Collez une grande feuille sur le sol', 'Montrez comment tenir un crayon', 'Faites un grand trait', 'Donnez-le à bébé et laissez-le aller', 'Nommez ce que vous voyez', 'Datez et conservez l\'œuvre d\'art'],
      rw: ['Mapirisha urupapuro runini hasi', 'Erekana ugufa ikaramu', 'Kora nombo nini', 'Muhe umwana ukamuhe gukora', 'Vuga ibyo ubona: "Birasa n\'uruziga!"', 'Andika itariki ukarinde ibyakozwe'],
    },
  },

  {
    id: 'L017', minM: 12, maxM: 24, domain: 'Cognitive', icon: '🔵🔴', durationMin: 12,
    materials: { en: ['Objects of same shape, 3 colours'], fr: ['Objets de même forme, 3 couleurs'], rw: ['Ibintu by\'ishusho imwe, amabara 3'] },
    title:  { en: 'Colour Sorting',           fr: 'Trier par Couleur',        rw: 'Gutandukanya Amabara' },
    desc:   {
      en: 'Sorting by colour builds early classification, an executive function skill linked to future reading and maths success.',
      fr: 'Trier par couleur développe la classification précoce, une compétence liée au succès en lecture et en mathématiques.',
      rw: 'Gutandukanya amabara biteramberesha gutandukanya ubwenge, ubushobozi bufitanye isano n\'iterambere mu gusoma no guharura.',
    },
    steps: {
      en: ['Put 3 coloured containers on the floor (red, blue, yellow)', 'Mix the matching coloured objects', 'Pick up one and say its colour, then place it in the right box', 'Hand baby one object and point to the right box', 'Celebrate when they get it right', 'Start with 2 colours before adding more'],
      fr: ['Mettez 3 contenants colorés sur le sol', 'Mélangez les objets de couleurs assorties', 'Prenez-en un et dites sa couleur', 'Donnez un objet à bébé et montrez la bonne boîte', 'Célébrez la bonne réponse', 'Commencez avec 2 couleurs'],
      rw: ['Shyira ikabiti 3 ry\'amabara hasi', 'Yanganya ibintu by\'amabara asimburana', 'Fata kimwe uvuge iraba ryacyo', 'Ha umwana kimwe ukamurebe ikabiti ryiza', 'Ishima agikurikira neza', 'Tangira n\'amabara 2 mbere yuko wongerera'],
    },
  },

  {
    id: 'L018', minM: 12, maxM: 24, domain: 'Social', icon: '🎭', durationMin: 15,
    materials: { en: ['Toy cup', 'Toy food (optional)'], fr: ['Tasse jouet', 'Aliments jouets (optionnel)'], rw: ['Ikigo cy\'ikinimo', 'Ifunguro ry\'ikinimo (ntabwo ngombwa)'] },
    title:  { en: 'Tea Party',                fr: 'Goûter Imaginaire',        rw: 'Ifunguro ry\'Uburyohe' },
    desc:   {
      en: 'Pretend play — tea parties, feeding dolls, driving toy cars — develops imagination, empathy and language. It\'s how toddlers make sense of the adult world around them.',
      fr: 'Le jeu symbolique développe l\'imagination, l\'empathie et le langage. C\'est ainsi que les enfants comprennent le monde adulte.',
      rw: 'Gukina ikinimo gifata ahirengehereye, gifatisha ingagi, gishimbisha imodoka — biteramberesha ubugome bw\'amagara, impuhwe n\'ururimi.',
    },
    steps: {
      en: ['Set out toy cups and "food"', 'Invite your child: "Let\'s have tea!"', 'Pour pretend tea and hand them a cup', 'Narrate: "It\'s hot! Blow on it!"', 'Have baby \'pour\' some for a doll', 'Ask: "More tea? Is it yummy?"'],
      fr: ['Disposez des tasses jouets et de la "nourriture"', 'Invitez: "On va boire le thé !"', 'Versez du thé imaginaire', 'Racontez: "C\'est chaud ! Soufflez dessus !"', 'Faites verser bébé à une poupée', 'Demandez: "Encore du thé ? C\'est bon ?"'],
      rw: ['Shyira ibigo by\'ikinimo n\'"ifunguro"', 'Reba umwana: "Tugiye kunywa icyayi!"', 'Sunika icyayi cy\'igitekerezo', 'Vuga: "Bishyushye! Funda!"', 'Ha ingagi icyayi', 'Baza: "Icyayi gishya? Biranyura?"'],
    },
  },

  {
    id: 'L019', minM: 12, maxM: 24, domain: 'Nature', icon: '🌿', durationMin: 20,
    materials: { en: ['Safe outdoor space'], fr: ['Espace extérieur sécurisé'], rw: ['Ahantu hateye hanze'] },
    title:  { en: 'Nature Walk',              fr: 'Promenade Nature',         rw: 'Inzira y\'Kamere' },
    desc:   {
      en: 'Sensory exposure to nature — textures, sounds, smells — activates multiple brain areas at once. Even a short garden walk delivers rich learning.',
      fr: 'L\'exposition sensorielle à la nature active plusieurs zones cérébrales simultanément. Même une courte promenade est riche en apprentissage.',
      rw: 'Kurebera kamere — ubusobe bw\'ibintu, amajwi, amasavu — bigana ahantu menshi h\'ubwonko icyarimwe.',
    },
    steps: {
      en: ['Go outside slowly, letting child set the pace', 'Stop at a leaf: "Feel this! It\'s smooth."', 'Find a stone: "Heavy or light?"', 'Listen: "What\'s that sound? A bird!"', 'Point to colours in plants and flowers', 'Collect 2–3 safe objects to explore inside', 'Tell a simple story about what you saw'],
      fr: ['Sortez lentement, laissez l\'enfant mener', 'Arrêtez à une feuille: "Touche ! C\'est lisse."', 'Trouvez une pierre: "Lourde ou légère ?"', 'Écoutez: "C\'est quoi ce son ? Un oiseau !"', 'Montrez les couleurs dans les plantes', 'Collectez 2–3 objets à explorer à l\'intérieur'],
      rw: ['Sohoka buhoro, umwana azehetse', 'Hagarara ku ikongorera: "Kora! Ni ikijuju."', 'Shaka ibuye: "Birucye cyangwa biremereye?"', 'Umvikana: "Ni iki? Inyoni!"', 'Reba amabara mu bimera no mu mamunanira', 'Chukura ibintu 2-3 kugirango ubasheshe imbere', 'Vuga inkuru yoroheje y\'ibyo mwarebaga'],
    },
  },

  {
    id: 'L020', minM: 12, maxM: 24, domain: 'Music', icon: '🎼', durationMin: 10,
    materials: { en: [], fr: [], rw: [] },
    title:  { en: 'Body Percussion',          fr: 'Percussions Corporelles',  rw: 'Ingoma y\'Umubiri' },
    desc:   {
      en: 'Clapping, stomping, and tapping different body parts teaches body awareness, rhythm, and listening. No instruments needed!',
      fr: 'Frapper, piétiner et tapoter différentes parties du corps enseigne la conscience corporelle et le rythme.',
      rw: 'Kufyina intoki, gutera intambwe, gukubita imirire itandukanye biga kumenyesha umubiri, amashami n\'ugutekereza.',
    },
    steps: {
      en: ['Stand facing your child', 'Clap hands twice — child copies', 'Stomp feet twice — child copies', 'Tap knees three times', 'Build a sequence: clap-stomp-tap', 'Increase speed gradually', 'Let child invent their own sequence for you to copy'],
      fr: ['Faites face à votre enfant', 'Frappez deux fois les mains — l\'enfant copie', 'Tapez deux fois des pieds', 'Tapotez les genoux trois fois', 'Créez une séquence: frapper-taper-tapoter', 'Augmentez la vitesse progressivement'],
      rw: ['Hagarara urebe umwana', 'Fyina intoki inshuro kabiri — umwana akigane', 'Tera intambwe inshuro kabiri', 'Kuba amavi inshuro gatatu', 'Kubaka inshingano: fina-tera-kuba', 'Yongera umuvuduko buhoro'],
    },
  },

  // ════════════════════════════════════════════════════════
  //  24 – 36  months
  // ════════════════════════════════════════════════════════

  {
    id: 'L021', minM: 24, maxM: 37, domain: 'Language', icon: '📖', durationMin: 15,
    materials: { en: ['Picture storybook'], fr: ['Livre d\'histoires illustré'], rw: ['Igitabo cy\'inkuru gifite amashusho'] },
    title:  { en: 'Story with Questions',     fr: 'Histoire avec Questions',  rw: 'Inkuru n\'Ibibazo' },
    desc:   {
      en: 'Asking questions before, during and after a story — "What do you think happens next?" — builds comprehension, prediction and narrative thinking.',
      fr: 'Poser des questions avant, pendant et après une histoire développe la compréhension et la pensée narrative.',
      rw: 'Kubaza ibibazo mbere, mu gihe no nyuma y\'inkuru — "Ubona ngo bizakomeza bite?" — biteramberesha gusobanukirwa no gutekereza mu makuru.',
    },
    steps: {
      en: ['Show the book cover: "What do you think this story is about?"', 'Read one page, then pause', 'Point to a character: "How is she feeling?"', 'Ask "What happens next?" before turning the page', 'At the end: "What was your favourite part?"', 'Let child retell the story in their own words'],
      fr: ['Montrez la couverture: "De quoi parle cette histoire ?"', 'Lisez une page, puis faites une pause', 'Montrez un personnage: "Comment se sent-elle ?"', 'Demandez "Que va-t-il se passer ?" avant de tourner la page'],
      rw: ['Erekana ikibaho cy\'igitabo: "Ubona iki inkuru iganira he?"', 'Soma urupapuro rumwe, hanyuma uhagarare', 'Reba umunyankuru: "Yumva rite?"', 'Baza "Bizakomeza bite?" mbere yo guhindura urupapuro'],
    },
  },

  {
    id: 'L022', minM: 24, maxM: 37, domain: 'Cognitive', icon: '🧱', durationMin: 20,
    materials: { en: ['Building blocks or Duplo'], fr: ['Blocs ou Duplo'], rw: ['Indobi cyangwa Duplo'] },
    title:  { en: 'Build a House',            fr: 'Construire une Maison',    rw: 'Kubaka Inzu' },
    desc:   {
      en: 'Open-ended construction play develops spatial reasoning, planning, persistence and problem-solving — all essential for STEM learning later.',
      fr: 'La construction libre développe le raisonnement spatial, la planification et la résolution de problèmes.',
      rw: 'Gukina no kubaka nta ntego ihamye biteramberesha ubwenge bw\'ahantu, gupanga no gukemura ibibazo.',
    },
    steps: {
      en: ['Set out blocks without instructions', 'Ask "Can you build a house for teddy?"', 'Build alongside without taking over', 'Comment on what you notice: "You put a big one at the bottom — good thinking!"', 'Problem-solve together when it falls', 'Take a photo of the finished build'],
      fr: ['Disposez les blocs sans instructions', 'Demandez "Peux-tu construire une maison pour nounours ?"', 'Construisez côte à côte sans prendre le dessus', 'Commentez ce que vous remarquez', 'Résolvez les problèmes ensemble quand ça tombe'],
      rw: ['Shiraho indobi nta mabwiriza', 'Baza "Washobora kubaka inzu ya teddy?"', 'Baka hafi nta gutwara ubuyobozi', 'Vuga ibyo ubona: "Washyize inini hepfo — wibwirije neza!"', 'Kemura ibibazo hamwe igihe bisurika'],
    },
  },

  {
    id: 'L023', minM: 24, maxM: 37, domain: 'Motor', icon: '🎨', durationMin: 20,
    materials: { en: ['Finger paint (non-toxic)', 'Large paper'], fr: ['Peinture pour doigts', 'Grand papier'], rw: ['Intura y\'intoki', 'Urupapuro runini'] },
    title:  { en: 'Finger Painting',          fr: 'Peinture aux Doigts',      rw: 'Gufora n\'Intoki' },
    desc:   {
      en: 'Finger painting engages the tactile, visual and motor cortex simultaneously. It builds fine motor skills, creativity, and sensory integration.',
      fr: 'La peinture aux doigts engage simultanément le cortex tactile, visuel et moteur.',
      rw: 'Gufora n\'intoki bifata ahantu h\'ubwonko h\'ukuganda, ukureba no gukora icyarimwe.',
    },
    steps: {
      en: ['Cover the table (or use a bath tray)', 'Put a small blob of one colour on paper', 'Show how to spread with a finger', 'Add a second colour and explore mixing', 'Name the new colour: "Red and yellow made orange!"', 'Let child go freely', 'Wash hands together after — a lesson in itself'],
      fr: ['Couvrez la table', 'Mettez une petite tache d\'une couleur', 'Montrez comment étaler avec un doigt', 'Ajoutez une deuxième couleur et explorez le mélange', 'Nommez la nouvelle couleur'],
      rw: ['Fata igitebe cyangwa ukoresha ahantu h\'ibara', 'Shyira ibara rimwe gato ku rupapuro', 'Erekana ugukwira n\'urutoki', 'Ongeraho ibara rya kabiri ukagumbatana', 'Vuga ibara rishya: "Umutuku n\'umuhondo baravangana uturutu!"'],
    },
  },

  {
    id: 'L024', minM: 24, maxM: 37, domain: 'Social', icon: '🤝', durationMin: 15,
    materials: { en: [], fr: [], rw: [] },
    title:  { en: 'Feelings Faces',           fr: 'Visages des Émotions',     rw: 'Ibibari by\'Ibyiyumvo' },
    desc:   {
      en: 'Emotional literacy begins with naming feelings. Children who can identify and label emotions behave better, form stronger friendships and handle conflict more calmly.',
      fr: 'L\'alphabétisation émotionnelle commence par nommer les sentiments. Les enfants qui identifient les émotions forment de meilleures amitiés.',
      rw: 'Kwiga ibyiyumvo bitangira no gutunga amazina y\'amabanga. Abana bamenye ibyiyumvo bagira inshuti nziza kandi bafite amahoro.',
    },
    steps: {
      en: ['Make a happy face and ask "What am I feeling?"', 'Make a sad face, then surprised, then angry', 'Show child a feelings chart or book with faces', 'Ask "When do YOU feel happy?"', 'Role-play: "Teddy is sad because…"', 'Validate every emotion: "It\'s OK to feel angry."'],
      fr: ['Faites une grimace heureuse: "Comment je me sens ?"', 'Triste, puis surpris, puis en colère', 'Montrez un tableau des émotions', 'Demandez "Quand TOI tu es heureux ?"', 'Jeu de rôle: "Nounours est triste parce que…"'],
      rw: ['Garagaza iseka ubaze "Numva rite?"', 'Agahinda, hanyuma gutegazwa, hanyuma umujinya', 'Erekana igitabo cy\'ibyiyumvo', 'Baza "Nawe ni ryari usa n\'umunezero?"', 'Kina: "Teddy afite agahinda kuko…"'],
    },
  },

  {
    id: 'L025', minM: 24, maxM: 37, domain: 'Nature', icon: '🌱', durationMin: 20,
    materials: { en: ['Small pot', 'Soil', 'Seeds (bean, sunflower)'], fr: ['Petit pot', 'Terre', 'Graines'], rw: ['Agahingiro gato', 'Ubutaka', 'Imbuto (imbwimba, indabyo)'] },
    title:  { en: 'Plant a Seed',             fr: 'Planter une Graine',       rw: 'Gutera Imbuto' },
    desc:   {
      en: 'Planting gives children a first-hand experience of life cycles, responsibility and patience. Even a bean in a cup teaches cause-and-effect over days.',
      fr: 'Planter donne aux enfants une expérience directe des cycles de vie et de la responsabilité.',
      rw: 'Gutera imbuto guha abana ubuhamya bw\'ibyoherezwa bw\'ubuzima, inshingano n\'inyumba.',
    },
    steps: {
      en: ['Fill the pot with soil together', 'Make a hole with one finger', 'Drop in 2–3 seeds: "They need a home underground!"', 'Water lightly', 'Place in sunlight and check daily', 'Mark a growth chart: draw the plant each week', 'Celebrate the first sprout!'],
      fr: ['Remplissez le pot de terre ensemble', 'Faites un trou avec un doigt', 'Mettez 2–3 graines: "Elles ont besoin d\'une maison sous la terre !"', 'Arrosez légèrement', 'Vérifiez chaque jour'],
      rw: ['Uzuza agahingiro n\'ubutaka hamwe', 'Koramo urwenge n\'urutoki', 'Sunika imbuto 2-3: "Zikeneye inzu munsi y\'ubutaka!"', 'Nyunyuza gake', 'Shyira ahari izuba ukagenzura buri munsi'],
    },
  },

  // ════════════════════════════════════════════════════════
  //  36 – 60  months
  // ════════════════════════════════════════════════════════

  {
    id: 'L026', minM: 36, maxM: 61, domain: 'Language', icon: '📝', durationMin: 15,
    materials: { en: ['Paper', 'Pencil or crayon'], fr: ['Papier', 'Crayon'], rw: ['Urupapuro', 'Ikaramu'] },
    title:  { en: 'My Story Book',            fr: 'Mon Livre d\'Histoires',   rw: 'Igitabo Cyanjye c\'Inkuru' },
    desc:   {
      en: 'Having a child dictate their own story while you write it teaches narrative structure, that spoken words become written words, and that their voice matters.',
      fr: 'Faire dicter une histoire à l\'enfant pendant que vous l\'écrivez enseigne la structure narrative.',
      rw: 'Gufatira umwana inkuru ye agukwizira uyandike bigisha imiterere y\'inkuru.',
    },
    steps: {
      en: ['Fold 4 sheets of paper into a booklet', 'Ask "Tell me a story"', 'Write exactly what they say, word for word', 'Ask "And then what happened?"', 'Let child draw pictures on each page', 'Read the finished book back to them', 'Keep it — it\'s a precious record'],
      fr: ['Pliez 4 feuilles en livret', 'Demandez "Raconte-moi une histoire"', 'Écrivez exactement ce qu\'ils disent', 'Demandez "Et ensuite que s\'est-il passé ?"', 'Laissez l\'enfant dessiner'],
      rw: ['Fota urupapuro 4 mu gitabo', 'Baza "Mpora inkuru"', 'Andika neza ibyo bavuga', 'Baza "Hanyuma nk\'iki?"', 'Reka umwana atore amashusho', 'Soma igitabo cyarangirije', 'Irinde — ni umurage w\'agaciro'],
    },
  },

  {
    id: 'L027', minM: 36, maxM: 61, domain: 'Cognitive', icon: '🔢', durationMin: 12,
    materials: { en: ['10 small objects (buttons, stones)'], fr: ['10 petits objets'], rw: ['Ibintu bito 10'] },
    title:  { en: 'Count Everything',         fr: 'Compter Partout',          rw: 'Kubara Ibintu Byose' },
    desc:   {
      en: 'Children understand number concepts through concrete, physical counting — not just reciting numbers. Touching each object while counting is called "one-to-one correspondence" and is a key pre-maths skill.',
      fr: 'Les enfants comprennent les nombres par le comptage concret. Toucher chaque objet en comptant est une compétence pré-mathématique clé.',
      rw: 'Abana basobanukirwa imibare binyuze mu kubara ibintu birehanwa — ntaho bihuye no gusubiramo imibare gusa.',
    },
    steps: {
      en: ['Place 5 objects in a line', 'Touch each one as you count aloud: "1… 2… 3…"', 'Ask child to touch and count after you', 'Ask "How many are there?"', 'Remove one: "Now how many?"', 'Practice with stairs, spoons, fingers', 'Make it a game anywhere you go'],
      fr: ['Placez 5 objets en ligne', 'Touchez chacun en comptant à voix haute', 'Demandez à l\'enfant de toucher et compter', 'Demandez "Combien y en a-t-il ?"', 'Enlevez un: "Et maintenant combien ?"'],
      rw: ['Shiraho ibintu 5 mu murongo', 'Kora buri kimwe urashoje: "1… 2… 3…"', 'Saba umwana gukora no kubara nyuma yawe', 'Baza "Ni ingahe?"', 'Vana kimwe: "None ni ingahe?"'],
    },
  },

  {
    id: 'L028', minM: 36, maxM: 61, domain: 'Motor', icon: '✂️', durationMin: 15,
    materials: { en: ['Child-safe scissors', 'Strips of paper'], fr: ['Ciseaux pour enfants', 'Bandes de papier'], rw: ['Izikobo z\'abana', 'Imigozi y\'urupapuro'] },
    title:  { en: 'Snip & Cut',               fr: 'Couper & Découper',        rw: 'Gukandagira & Gucamo' },
    desc:   {
      en: 'Using scissors requires both hands to work together and builds the pincer grip needed for pencil control and writing.',
      fr: 'Utiliser des ciseaux nécessite la coopération des deux mains et développe la prise de pince nécessaire pour l\'écriture.',
      rw: 'Gukoresha izikobo bisaba intoki zombi gukorana, bikomeza ufasha ukoresheje ikaramu.',
    },
    steps: {
      en: ['Show child how to hold scissors (thumb up)', 'Start with snipping fringes on a paper strip', 'Practice opening and closing', 'Graduate to cutting along a straight line', 'Try curved lines', 'Cut pictures from an old magazine'],
      fr: ['Montrez comment tenir les ciseaux (pouce en haut)', 'Commencez par couper des franges', 'Pratiquez l\'ouverture et la fermeture', 'Passez à couper le long d\'une ligne droite', 'Essayez les lignes courbes'],
      rw: ['Erekana ugufata izikobo (igihe kinini hejuru)', 'Tangira gukandagira imigozi', 'Subiramo kugura no gufunga', 'Hitabire gucamo umurongo utabengana', 'Gerageza imirongo isunikirana'],
    },
  },

  {
    id: 'L029', minM: 36, maxM: 61, domain: 'Social', icon: '🎲', durationMin: 20,
    materials: { en: ['Simple board game or card game'], fr: ['Jeu de société simple'], rw: ['Ikino k\'amakari cyangwa ay\'amacupa'] },
    title:  { en: 'Taking Turns',             fr: 'Attendre son Tour',        rw: 'Gutegereza Inshuro Yawe' },
    desc:   {
      en: 'Turn-taking is one of the most important social skills. Learning to wait, to win without gloating and lose without upset are lifelong emotional regulation skills.',
      fr: 'Attendre son tour est l\'une des compétences sociales les plus importantes. Gagner et perdre avec grâce sont des compétences de régulation émotionnelle.',
      rw: 'Gutegereza inshuro yawe ni ubushobozi bw\'imibereho bw\'ingenzi. Kwiga gutekereza inshuro ubeshyo n\'ukunyurwa ni ubushobozi bw\'ibyiyumvo bw\'ubuzima bwose.',
    },
    steps: {
      en: ['Explain the rules simply', 'Model taking turns: "My turn, then your turn"', 'Narrate what\'s happening: "Now I wait for you"', 'If child struggles to wait, count to 5 together', 'React the same whether you win or lose', 'Praise the process: "Great waiting!" not just the outcome'],
      fr: ['Expliquez les règles simplement', 'Montrez les tours: "Mon tour, puis le tien"', 'Racontez: "Maintenant j\'attends"', 'Si l\'enfant a du mal, comptez jusqu\'à 5 ensemble'],
      rw: ['Sobanura amategeko yoroheje', 'Erekana inshuro: "Inshuro yanjye, hanyuma iyawe"', 'Vuga ibiriho: "None ntegereza"', 'Niba umwana adashobora gutegereza, bare kugeza 5 hamwe'],
    },
  },

  {
    id: 'L030', minM: 36, maxM: 61, domain: 'Nature', icon: '🔍', durationMin: 20,
    materials: { en: ['Magnifying glass (optional)', 'Notebook'], fr: ['Loupe (optionnelle)', 'Carnet'], rw: ['Inzuzi nini (ntabwo ngombwa)', 'Ikaye'] },
    title:  { en: 'Bug Detective',            fr: 'Détective Insectes',       rw: 'Inzobere y\'Inzoka' },
    desc:   {
      en: 'Looking closely at insects teaches observation, patience, scientific thinking, and respect for small living things. Even finding a worm is a discovery.',
      fr: 'Observer de près les insectes enseigne l\'observation et la pensée scientifique.',
      rw: 'Kureba inzoka neza bigisha gutekereza, kwirinda no gutinya ibintu byoroheje biracaza.',
    },
    steps: {
      en: ['Go to a garden or grassy area', 'Lift a stone or leaf carefully', 'Look quietly for 30 seconds before touching', 'Ask "How many legs does it have?"', 'Draw it in the notebook', 'Put everything back as you found it', 'Look up the creature at home'],
      fr: ['Allez dans un jardin ou une zone herbeuse', 'Soulevez doucement une pierre ou une feuille', 'Regardez en silence 30 secondes', 'Demandez "Combien de pattes a-t-il ?"', 'Dessinez-le dans le carnet'],
      rw: ['Jya mu murima cyangwa ahantu huzuyemo ubwatsi', 'Kura ibuye cyangwa ikongorera buhoro', 'Reba mu mahoro amasegonda 30', 'Baza "Ni ingahe amaguru afite?"', 'Ryosha mu kaye'],
    },
  },

  {
    id: 'L031', minM: 36, maxM: 61, domain: 'Music', icon: '🎹', durationMin: 15,
    materials: { en: ['Keyboard app or toy xylophone'], fr: ['App clavier ou xylophone jouet'], rw: ['Application ya kiyibodi cyangwa xilofone y\'ikinimo'] },
    title:  { en: 'High & Low Sounds',        fr: 'Sons Aigus & Graves',      rw: 'Amajwi Hejuru & Hasi' },
    desc:   {
      en: 'Understanding pitch — high and low notes — develops auditory discrimination, which underpins both music learning and phonics for reading.',
      fr: 'Comprendre les hauteurs sonores développe la discrimination auditive, base de la musique et de la phonique.',
      rw: 'Gusobanukirwa amajwi y\'hejuru n\'ay\'hasi biteramberesha gutekereza amajwi, inshingano y\'indirimbo no kwiga gusoma.',
    },
    steps: {
      en: ['Press a high note: "Hear that? It\'s HIGH!"', 'Press a low note: "That\'s LOW!"', 'Ask child to identify: "High or low?"', 'Sing a scale going up: "do-re-mi-fa-sol"', 'Ask child to match your voice going up and down', 'Make high sounds with your voice, low with your chest'],
      fr: ['Appuyez sur une note aiguë: "Tu entends? C\'est AIGU !"', 'Appuyez sur une note grave: "C\'est GRAVE !"', 'Demandez à l\'enfant d\'identifier', 'Chantez une gamme montante'],
      rw: ['Kanda ijwi ryo hejuru: "Uwumva? Ni HEJURU!"', 'Kanda ijwi ryo hasi: "Ni HASI!"', 'Saba umwana gutandukanya', 'Bina gamme irizamuka: "do-re-mi-fa-sol"'],
    },
  },

  // ════════════════════════════════════════════════════════
  //  48 – 72  months
  // ════════════════════════════════════════════════════════

  {
    id: 'L032', minM: 48, maxM: 73, domain: 'Language', icon: '🔤', durationMin: 15,
    materials: { en: ['Alphabet cards or foam letters'], fr: ['Cartes alphabet ou lettres en mousse'], rw: ['Ibikapu by\'inyuguti cyangwa inyuguti za fomu'] },
    title:  { en: 'Letter Sounds',            fr: 'Sons des Lettres',         rw: 'Amajwi y\'Inyuguti' },
    desc:   {
      en: 'Phonemic awareness — matching letters to sounds — is the single strongest predictor of reading success. Making it playful removes all pressure.',
      fr: 'La conscience phonémique — associer lettres et sons — est le meilleur prédicteur de la réussite en lecture.',
      rw: 'Kumenya inyuguti — guhuza inyuguti n\'amajwi — ni igiteguro cy\'ingenzi cy\'amahirwe yo gusoma.',
    },
    steps: {
      en: ['Hold up the letter A: "This is A. It says Aaaaah"', 'Think of a word: "Apple starts with A"', 'Find things in the room starting with A', 'Move to B: "Ball, Bus, Baby — B says Buh"', 'Practice 2 letters per session max', 'Make it a game: I Spy with letter sounds'],
      fr: ['Montrez la lettre A: "C\'est A. Il dit Aaah"', 'Pensez à un mot: "Avion commence par A"', 'Trouvez des choses dans la pièce commençant par A', 'Passez à B: "Ballon, Bébé — B dit Buh"'],
      rw: ['Erekana inyuguti A: "Iyi ni A. Ivuga Aaah"', 'Tekereza ijambo: "Amashyiga atangira na A"', 'Shaka ibintu mu cyumba bitangira na A', 'Hitabire B: "Bwa, Buyi — B ivuga Buh"'],
    },
  },

  {
    id: 'L033', minM: 48, maxM: 73, domain: 'Cognitive', icon: '🗺️', durationMin: 20,
    materials: { en: ['Paper', 'Crayons'], fr: ['Papier', 'Crayons'], rw: ['Urupapuro', 'Ikaramu'] },
    title:  { en: 'Draw Our Home',            fr: 'Dessiner Notre Maison',    rw: 'Gushorera Inzu Yacu' },
    desc:   {
      en: 'Drawing a map of their home teaches spatial thinking, symbolic representation (a drawing can stand for a real place) and sequencing.',
      fr: 'Dessiner une carte de la maison enseigne la pensée spatiale et la représentation symbolique.',
      rw: 'Gushorera ikarita y\'inzu yawe bigisha gutekereza ahantu no kuvuga ibintu mu mazina y\'ibimenyetso.',
    },
    steps: {
      en: ['Walk through each room together first', 'Ask "If we were birds looking down, what would we see?"', 'Draw the outline of the home on paper', 'Let child add rooms: "Where is your bedroom?"', 'Add furniture as simple shapes', 'Add the garden and outside areas', 'Display the map proudly on the wall'],
      fr: ['Parcourez chaque pièce ensemble', 'Demandez "Si nous étions des oiseaux, que verrions-nous ?"', 'Dessinez le contour de la maison', 'Laissez l\'enfant ajouter des pièces'],
      rw: ['Zunguruka mu cyumba cyose hamwe', 'Baza "Niba twaba inyoni zureba hasi, tubona iki?"', 'Shorera inkambi y\'inzu ku rupapuro', 'Reka umwana ongeraho ibyumba'],
    },
  },

  {
    id: 'L034', minM: 48, maxM: 73, domain: 'Social', icon: '❤️', durationMin: 15,
    materials: { en: [], fr: [], rw: [] },
    title:  { en: 'Kindness in Action',       fr: 'La Gentillesse en Action', rw: 'Ubugwaneza mu Bikorwa' },
    desc:   {
      en: 'Teaching kindness deliberately — helping someone, sharing, saying thank you — builds prosocial behaviour that lasts a lifetime.',
      fr: 'Enseigner la gentillesse délibérément construit des comportements prosociaux durables.',
      rw: 'Kwigisha ubugwaneza biremereye — gufasha, kugabana, gushimira — bikubaka imyitwarire myiza ikomeza ubuzima bwose.',
    },
    steps: {
      en: ['Talk about what kindness is: "Kindness is making someone feel good"', 'Brainstorm 3 kind things to do today', 'Do one together right now (help tidy up, make a card for someone)', 'At dinner: "What kind thing did you do today?"', 'Read a book featuring kind characters', 'Praise specific kindness: "I saw you share your snack — that was really kind"'],
      fr: ['Parlez de la gentillesse: "La gentillesse rend quelqu\'un heureux"', 'Réfléchissez à 3 choses gentilles à faire', 'Faites-en une ensemble maintenant', 'Au dîner: "Qu\'as-tu fait de gentil aujourd\'hui ?"'],
      rw: ['Vugana ku bugwaneza: "Ubugwaneza ni gufanya umuntu yishimire"', 'Tekereza ibikorwa 3 by\'ubugwaneza', 'Kora kimwe hamwe nonaha', 'Ku ifunguro: "Wakoze iki cy\'ubugwaneza uyu munsi?"'],
    },
  },

  {
    id: 'L035', minM: 48, maxM: 73, domain: 'Nature', icon: '🌦️', durationMin: 15,
    materials: { en: ['Window', 'Notebook'], fr: ['Fenêtre', 'Carnet'], rw: ['Idirishya', 'Ikaye'] },
    title:  { en: 'Weather Watcher',          fr: 'Observateur Météo',        rw: 'Umuraba w\'Ibihe' },
    desc:   {
      en: 'Daily weather observation builds scientific habits: observing, recording, predicting. It introduces vocabulary for all weather conditions.',
      fr: 'Observer la météo quotidiennement développe les habitudes scientifiques: observer, enregistrer, prédire.',
      rw: 'Kureba ibihe buri munsi biteramberesha imyifatire y\'ubumenyi bwa siyansi: kureba, kwandika, guhanura.',
    },
    steps: {
      en: ['Every morning: look out the window together', 'Ask "What do you see? Sunny, cloudy, rainy?"', 'Draw a simple weather symbol in the notebook', 'Ask "What should we wear today?"', 'At the end of the week: count the sunny vs rainy days', 'Make a simple bar chart with coloured squares'],
      fr: ['Chaque matin: regardez par la fenêtre ensemble', 'Demandez "Que vois-tu ? Soleil, nuages, pluie ?"', 'Dessinez un symbole météo dans le carnet', 'Demandez "Que devons-nous porter ?"'],
      rw: ['Buri gitondo: murebe hanze idirishya hamwe', 'Baza "Ubona iki? Izuba, ibicu, imvura?"', 'Shorera ikimenyetso cy\'ibihe mu kaye', 'Baza "Tugomba kwambara iki uyu munsi?"'],
    },
  },

  {
    id: 'L036', minM: 48, maxM: 73, domain: 'Music', icon: '🎙️', durationMin: 15,
    materials: { en: [], fr: [], rw: [] },
    title:  { en: 'Make Up a Song',           fr: 'Composer une Chanson',     rw: 'Gukora Indirimbo' },
    desc:   {
      en: 'Composing simple songs develops creativity, phonological awareness, and narrative thinking. Any melody is correct — there are no wrong songs.',
      fr: 'Composer des chansons simples développe la créativité et la conscience phonologique.',
      rw: 'Gukora indirimbo yoroheje biteramberesha ubugome bw\'amagara, kumenya amajwi y\'amagambo, no gutekereza mu makuru.',
    },
    steps: {
      en: ['Pick a topic: a pet, food, the sun', 'Ask "What words do we know about ___?"', 'Find two words that rhyme: cat / hat', 'Sing the rhyme to a familiar tune (Twinkle Twinkle)', 'Make up a second line together', 'Sing the whole thing through', 'Write the lyrics down and illustrate them'],
      fr: ['Choisissez un sujet: un animal, la nourriture', 'Demandez "Quels mots connaissons-nous sur ___?"', 'Trouvez deux mots qui riment', 'Chantez la rime sur un air connu'],
      rw: ['Hitamo insanganyamatsiko: inyambo, indyo, izuba', 'Baza "Ni amagambo atahe tuzizi kuri ___?"', 'Shaka amagambo abiri ageraho: injangwe/iriti', 'Bina amagambo mu makara azwi'],
    },
  },
];

// ── Helpers ───────────────────────────────────────────────

export const DOMAINS = ['All', 'Language', 'Motor', 'Cognitive', 'Social', 'Music', 'Nature'];

export const DOMAIN_CONFIG = {
  Language:  { color: '#2F80ED', light: '#E8F1FF', badge: 'primary',  icon: '💬' },
  Motor:     { color: '#27AE60', light: '#E6F9EE', badge: 'success',  icon: '🏋️' },
  Cognitive: { color: '#2D9CDB', light: '#E8F5FD', badge: 'info',     icon: '🧠' },
  Social:    { color: '#F2994A', light: '#FEF3E8', badge: 'warning',  icon: '🤝' },
  Music:     { color: '#9B51E0', light: '#F3E8FF', badge: 'neutral',  icon: '🎵' },
  Nature:    { color: '#219653', light: '#E3F9EC', badge: 'success',  icon: '🌿' },
};

export function getLessonsForChild(ageMonths, domainFilter = 'All') {
  return LESSONS.filter(
    (l) => ageMonths >= l.minM && ageMonths < l.maxM &&
           (domainFilter === 'All' || l.domain === domainFilter),
  );
}
