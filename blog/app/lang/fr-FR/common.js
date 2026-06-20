export default {
  languageName: 'Français (France)',
  actions: {
    create: 'Créer',
    edit: 'Modifier',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    search: 'Rechercher',
    reset: 'Réinitialiser',
    previous: 'Précédent',
    next: 'Suivant',
    preview: 'Aperçu',
    publish: 'Publier'
  },
  status: {
    loading: 'Chargement',
    empty: 'Aucun contenu pour le moment',
    error: 'Échec du chargement'
  },
  time: {
    justNow: 'à l’instant',
    secondsAgo: 'il y a {count} s',
    minutesAgo: 'il y a {count} min',
    hoursAgo: 'il y a {count} h',
    daysAgo: 'il y a {count} j'
  },
  error: {
    refresh: 'Actualiser',
    backHome: 'Retour à l’accueil',
    notFound: 'La page recherchée n’existe pas.',
    forbidden: 'Vous n’avez pas l’autorisation d’accéder à cette page.',
    maintenanceUpdating:
      'Le serveur est en cours de mise à jour. Veuillez réessayer plus tard.',
    maintenance: 'Le serveur est en maintenance. Veuillez réessayer plus tard.',
    languageSwitchFailed:
      'Le changement de langue a échoué. Veuillez réessayer plus tard.'
  },
  calendar: {
    weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    yearMonth: '{month}/{year}'
  },
  clipboard: {
    copySuccess: 'Copié',
    copyFailed: 'Échec de la copie'
  },
  album: {
    empty: 'Aucun contenu associé'
  },
  emoji: {
    button: 'Emoji',
    empty: 'Aucun emoji pour le moment',
    frequent: '🕒'
  },
  rating: {
    points: '{score}',
    level: {
      masterpiece: 'Top',
      excellent: 'Très bon',
      good: 'Bon',
      okay: 'Correct',
      poor: 'Moyen',
      bad: 'Mauvais',
      terrible: 'Très mal',
      awful: 'Affreux',
      confused: 'Bizarre',
      what: '???',
      none: 'Non noté'
    }
  },
  media: {
    bangumi: 'Anime',
    movie: 'Film',
    browseAll: 'Parcourir tous les médias'
  },
  season: {
    winter: 'Hiver',
    spring: 'Printemps',
    summer: 'Été',
    autumn: 'Automne',
    all: 'Toutes les saisons'
  },
  duration: {
    minute: '{count} min',
    hour: '{count} h',
    day: '{count} j',
    week: '{count} sem.',
    weekDay: '{weeks} sem. {days} j',
    month: '{count} mois',
    monthDay: '{months} mois {days} j',
    year: '{count} an',
    yearMonth: '{years} ans {months} mois'
  },
  image: {
    loading: 'Chargement de l’image...',
    loadFailed: 'Échec du chargement de l’image'
  },
  panorama: {
    zoom: 'Zoom',
    zoomOut: 'Zoom arrière',
    zoomIn: 'Zoom avant',
    moveUp: 'Déplacer vers le haut',
    moveDown: 'Déplacer vers le bas',
    moveLeft: 'Déplacer vers la gauche',
    moveRight: 'Déplacer vers la droite',
    description: 'Description',
    download: 'Télécharger',
    fullscreen: 'Plein écran',
    loading: 'Chargement...',
    menu: 'Menu',
    close: 'Fermer',
    twoFingers: 'Utilisez deux doigts pour naviguer',
    ctrlZoom: 'Utilisez Ctrl + molette pour zoomer l’image',
    loadError: 'Échec du chargement du panorama',
    webglError: 'Votre navigateur ne prend peut-être pas en charge WebGL',
    gyroscope: 'Vue gyroscope',
    screenshot: 'Capture d’écran',
    switchLens: 'Changer de mode d’objectif',
    descriptionToggle: 'Afficher/masquer la description',
    enterModeTip: 'Cliquez pour entrer en mode panorama 360',
    panorama360: 'Panorama 360',
    vrMode: 'Mode VR',
    vrEnterFailed:
      'Impossible d’entrer en mode VR. Vérifiez les autorisations ou la compatibilité de l’appareil.',
    vrInitFailed:
      'Impossible d’initialiser le mode VR. Vérifiez les autorisations ou la compatibilité de l’appareil.'
  },
  vote: {
    endTime: 'Se termine à',
    totalVotes: '{count} votes',
    maxSelect: 'Choisissez jusqu’à {count}',
    showResultAfter: 'Résultats affichés après le vote',
    chooseOption: 'Veuillez choisir une option',
    success: 'Vote envoyé',
    loading: 'Chargement...',
    voting: 'Vote en cours...',
    voted: 'Déjà voté',
    sameIpVoted: 'Cette IP a déjà voté',
    ended: 'Le vote est terminé',
    submit: 'Envoyer',
    maxSelectExceeded: 'Vous pouvez sélectionner jusqu’à {count}'
  },
  acgn: {
    relatedPost: 'Articles associés',
    relatedAlbum: 'Album associé',
    noContent: 'Aucun contenu pour le moment',
    labels: 'Libellés : ',
    expand: '<Plus>',
    collapse: '<Moins>',
    yearSeason: '{season} {year}',
    dateFormat: 'yyyy-MM-dd hh:mm',
    dropped: 'Abandonné',
    reading: 'En cours de lecture',
    playing: 'En cours de jeu',
    readAfterDropped: 'Abandonné après {duration} de lecture',
    playAfterDropped: 'Abandonné après {duration} de jeu',
    accumulatedRead: 'Lecture cumulée',
    totalRead: 'Temps de lecture total',
    accumulatedPlay: 'Temps de jeu cumulé',
    totalPlay: 'Temps de jeu total',
    watchedOn: 'Vu le {year}-{month}-{day}'
  },
  navigation: {
    home: 'Accueil',
    menu: 'Navigation',
    sidebar: 'Barre latérale'
  },
  sidebarBuiltinTitles: {
    1: 'Contenu personnalisé',
    3: 'Commentaires récents',
    4: 'Tags aléatoires',
    8: 'Catégories',
    9: 'Archives',
    10: 'Publicités Google',
    11: 'HTML personnalisé',
    12: 'Articles populaires',
    13: 'Anime de la saison',
    14: 'Jeux en cours',
    15: 'Lectures en cours'
  },
  search: {
    placeholder: 'Saisissez des mots-clés',
    title: 'Recherche : {keyword}'
  },
  trend: {
    heat: 'Popularité'
  },
  map: {
    markerListTitle: 'Repères de carte',
    viewDetail: 'Cliquez pour voir les détails',
    emptyMarkers: 'Aucun repère de carte',
    relatedPostEmpty: 'Aucun article associé',
    dataLoading: 'Chargement des données...',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière'
  },
  qrcode: {
    title: 'Code QR',
    emptyText: 'Le texte du code QR ne peut pas être vide',
    generateFailed: 'Échec de la génération du code QR'
  },
  share: {
    title: 'Partager vers',
    copyLink: 'Copier le lien',
    toWeibo: 'Partager sur Weibo',
    toQzone: 'Partager sur QQ Zone',
    toX: 'Partager sur X',
    toFacebook: 'Partager sur Facebook',
    toReddit: 'Partager sur Reddit',
    toTelegram: 'Partager sur Telegram',
    toLine: 'Partager sur LINE',
    toWhatsapp: 'Partager sur WhatsApp'
  },
  theme: {
    title: 'Mode du thème',
    system: 'Système',
    light: 'Clair',
    dark: 'Sombre'
  },
  related: {
    blog: 'Articles associés :',
    tweet: 'Tweets associés :',
    event: 'Événements associés :',
    work: 'Œuvres associées :',
    vote: 'Votes associés :'
  },
  link: {
    bilibiliVideo: 'Vidéo Bilibili-{videoId}',
    noDescription: 'Aucune description'
  },
  pageAbout: {
    noDescription: 'Aucune introduction pour le moment'
  },
  pageEvent: {
    emptyMonth: 'Rien ne s’est passé ce mois-ci',
    emptyDay: 'Rien ne s’est passé ce jour-là',
    dayTitle: 'Événements du {date}',
    dayDateFormat: 'd/M/yyyy'
  },
  pageBangumi: {
    keywordLabel: 'Mot-clé',
    keywordPlaceholder: 'Saisissez des mots-clés',
    yearLabel: 'Année',
    seasonLabel: 'Saison',
    statusLabel: 'Statut',
    cancel: 'Annuler',
    apply: 'Filtrer',
    defaultSort: 'Tri par défaut',
    ratingSort: 'Trier par note',
    allYears: 'Toutes les années',
    yearValue: '{year}',
    allStatus: 'Tous',
    droppedStatus: 'Abandonné',
    appliedFilters: '{count} filtres appliqués',
    allContent: 'Tout le contenu',
    totalBangumi: '{count} titres'
  },
  pageMedia: {
    keywordLabel: 'Mot-clé',
    keywordPlaceholder: 'Saisissez des mots-clés',
    typeLabel: 'Type',
    allTypes: 'Tous les types',
    platformLabel: 'Plateforme',
    allPlatforms: 'Toutes les plateformes',
    statusLabel: 'Statut',
    watchYearLabel: 'Année de visionnage',
    allYears: 'Toutes les années',
    cancel: 'Annuler',
    apply: 'Filtrer',
    startTimeSort: 'Trier par date de début',
    watchTimeSort: 'Trier par date de visionnage',
    ratingSort: 'Trier par note',
    allContent: 'Tout le contenu',
    appliedFilters: '{count} filtres appliqués',
    totalWorks: '{count} titres',
    totalMovies: '{count} films',
    bookUnread: 'Non lu',
    bookReading: 'En cours de lecture',
    bookFinished: 'Terminé',
    gameUnplayed: 'Non commencé',
    gamePlaying: 'En cours',
    gameFinished: 'Terminé'
  },
  footer: {
    sitemap: 'Plan du site',
    rssSubscribe: 'RSS : ',
    rssAll: 'Tous les articles',
    rssBlog: 'Articles de blog',
    rssTweet: 'Tweets',
    rssAllTitle: 'RSS',
    rssBlogTitle: 'RSS du blog',
    rssTweetTitle: 'RSS des tweets'
  },
  post: {
    pinned: 'Épinglé',
    defaultExcerpt: 'A publié un article',
    views: '{count} vues',
    comments: '{count} commentaires',
    shares: '{count} partages',
    likes: '{count} mentions J’aime',
    filterType: 'Filtrer par type',
    allTypes: 'Tous les types',
    blog: 'Blog',
    tweet: 'Tweet',
    page: 'Page',
    shortBlog: 'B',
    shortTweet: 'T',
    listHome: 'Accueil',
    listHomePage: 'Accueil - Page {page}',
    listKeyword: 'Recherche : {keyword}',
    listSort: 'Articles de catégorie',
    listArchive: 'Archives : {year}-{month}',
    listTag: 'Articles tagués',
    listMappoint: 'Articles par lieu',
    listBangumi: 'Articles liés aux anime',
    listMovie: 'Articles liés aux films',
    listBook: 'Articles liés aux livres',
    listGame: 'Articles liés aux jeux',
    listDefault: 'Liste des articles',
    noTitle: 'Sans titre',
    noTitleOrContent: 'Aucun titre ni contenu',
    tweetTitle: 'Tweet',
    author: 'Auteur : ',
    publishedAt: 'Publié le : {date}',
    time: 'Heure : ',
    sort: 'Catégorie : ',
    runCode: 'Exécuter le code',
    tableOfContents: 'Table des matières'
  },
  comment: {
    publish: 'Publier un commentaire :',
    saveUserInfo: 'Enregistrer ce profil après publication',
    clearUserInfo: 'Effacer le profil maintenant',
    userInfoCleared: 'Profil effacé',
    placeholder: 'Écrivez quelque chose...',
    nickname: 'Pseudo',
    email: 'E-mail (facultatif)',
    website: 'Site web (facultatif)',
    submit: 'Envoyer',
    closed: 'Les commentaires sont fermés',
    validatorLoadFailed:
      'Échec du chargement de la validation. Veuillez réessayer plus tard',
    nicknameRequired: 'Le pseudo est obligatoire',
    nicknameMax: 'Le pseudo doit contenir au plus 20 caractères',
    contentRequired: 'Le contenu du commentaire est obligatoire',
    contentMin: 'Le commentaire doit contenir au moins {count} caractères',
    contentMax: 'Le commentaire doit contenir au plus 500 caractères',
    urlMax: 'L’URL doit contenir au plus 200 caractères',
    urlInvalid: 'Le format de l’URL est invalide',
    emailMax: 'L’e-mail doit contenir au plus 100 caractères',
    emailInvalid: 'Le format de l’e-mail est invalide',
    successPending: 'Commentaire envoyé. Il sera visible après validation',
    success: 'Commentaire envoyé',
    retractButton: 'Retirer ({seconds}s restantes)',
    retractTitle: 'Retirer le commentaire',
    retractConfirmText: 'Voulez-vous vraiment retirer ce commentaire ?',
    cancel: 'Annuler',
    confirmRetract: 'Retirer',
    retractExpired: 'Le délai de retrait a expiré',
    retractSuccess: 'Commentaire retiré',
    copyContent: 'Copier le contenu du commentaire',
    title: 'Commentaires :',
    sortByDate: 'Par date',
    sortByLike: 'Par mentions J’aime',
    admin: 'Admin',
    pending: 'En attente de validation',
    deleted: 'Ce commentaire n’est plus visible...',
    reply: 'Répondre',
    empty: 'Soyez le premier à commenter',
    lost: 'Ce commentaire n’est peut-être plus visible...',
    lostPaged:
      'Ce commentaire n’est peut-être plus visible, ou se trouve sur une page de commentaires plus profonde...'
  }
}
