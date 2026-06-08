export default {
  title: 'Calendrier de chance du programmeur',
  loading: 'Calcul de la chance du jour...',
  goodTitle: 'À faire',
  badTitle: 'À éviter',
  seatDirectionLabel: 'Direction du siège :',
  seatDirectionText:
    'Codez en faisant face au {direction} pour rencontrer moins d’erreurs.',
  drinkLabel: 'Boisson du jour :',
  goddessLabel: 'Affinité avec votre crush :',
  todayText: 'Nous sommes {week}, le {day}/{month}/{year}',
  drinkSeparator: ', ',
  weeks: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  directions: [
    'Nord',
    'Nord-est',
    'Est',
    'Sud-est',
    'Sud',
    'Sud-ouest',
    'Ouest',
    'Nord-ouest'
  ],
  activities: [
    {
      name: 'Écrire des tests unitaires',
      good: 'Les tests unitaires réduiront les erreurs',
      bad: 'Les tests unitaires ralentiront votre rythme de développement'
    },
    {
      name: 'Prendre une douche',
      good: 'Cela fait quelques jours, non ?',
      bad: 'Vous pourriez rincer votre inspiration de conception',
      weekend: true
    },
    {
      name: 'Faire du sport',
      good: 'Il est temps d’étirer ces muscles raides',
      bad: 'Vous brûlerez peu d’énergie et mangerez encore plus',
      weekend: true
    },
    {
      name: 'Fumer',
      good: 'Cela pourrait vous réveiller, même si fumer reste dangereux',
      bad: 'Fumer nuit à la santé',
      weekend: true
    },
    {
      name: 'Déployer de jour',
      good: 'Une mise en production de jour est sûre aujourd’hui',
      bad: 'Cela pourrait avoir des conséquences catastrophiques'
    },
    {
      name: 'Refactoriser',
      good: 'La qualité du code s’améliorera',
      bad: 'Vous pourriez rester bloqué dans des régressions'
    },
    {
      name: 'Utiliser %t',
      good: 'Vous aurez l’air plus raffiné',
      bad: 'On pourrait croire que vous frimez'
    },
    {
      name: 'Changer de travail',
      good: 'Il faut savoir lâcher prise',
      bad: 'Avec cette économie, le prochain poste ne sera peut-être pas mieux'
    },
    {
      name: 'Recruter quelqu’un',
      good: 'Cette personne pourrait avoir un vrai potentiel',
      bad: 'Cette personne sait-elle seulement coder ?'
    },
    {
      name: 'Passer un entretien',
      good: 'Le recruteur est de bonne humeur aujourd’hui',
      bad: 'Le recruteur est agacé et pourrait se défouler sur vous'
    },
    {
      name: 'Donner votre démission',
      good: 'L’entreprise a trouvé quelqu’un de moins cher et plus compétent',
      bad: 'Avec cette économie, le prochain poste ne sera peut-être pas mieux'
    },
    {
      name: 'Demander une augmentation',
      good: 'Le patron est de bonne humeur aujourd’hui',
      bad: 'L’entreprise envisage des licenciements'
    },
    {
      name: 'Faire des heures sup ce soir',
      good: 'La nuit est le moment où les programmeurs sont les plus alertes',
      bad: 'Vous êtes déjà épuisé, reposez-vous',
      weekend: true
    },
    {
      name: 'Vous vanter devant votre crush',
      good: 'Votre image s’améliore un peu',
      bad: 'Vous serez percé à jour immédiatement',
      weekend: true
    },
    {
      name: 'Tirer des cartes sur Wikimoe',
      good: 'Vous avez des chances d’obtenir la carte voulue',
      bad: 'Des cartes inutiles tomberont du ciel',
      weekend: true
    },
    {
      name: 'Écrire un article technique',
      good: 'Un nouveau chef-d’œuvre de contenu va naître',
      bad: 'Votre article pourrait être copié',
      weekend: true
    },
    {
      name: 'Nommer une variable "%v"',
      good: 'Le nom de variable paraît étonnamment mignon',
      bad: 'Vous ne référencerez plus jamais cette variable'
    },
    {
      name: 'Écrire une méthode de plus de %l lignes',
      good: 'Votre code est assez organisé pour survivre à cette longueur',
      bad: 'Le code deviendra incompréhensible'
    },
    {
      name: 'Commit du code',
      good: 'Le risque de conflits est au plus bas',
      bad: 'Une montagne de conflits vous fera douter du planning'
    },
    {
      name: 'Relire du code',
      good: 'Vous repérerez plus sûrement les problèmes importants',
      bad: 'Vous ne trouverez rien et perdrez toute la séance'
    },
    {
      name: 'Assister à une réunion',
      good: 'Une petite sieste loin du code est bonne pour la santé',
      bad: 'Vous pourriez finir par porter le chapeau'
    },
    {
      name: 'Jouer à Overwatch',
      good: 'Vous vous sentirez béni par les dieux',
      bad: 'Vous vous ferez écraser',
      weekend: true
    },
    {
      name: 'Déployer de nuit',
      good: 'La nuit est le moment où les programmeurs sont les plus alertes',
      bad: 'Vous avez déjà dépensé toute votre énergie le jour'
    },
    {
      name: 'Corriger des problèmes',
      good: 'Votre flair pour les problèmes est exceptionnellement aiguisé',
      bad: 'Vous créerez plus de problèmes que vous n’en corrigerez'
    },
    {
      name: 'Revue de design',
      good: 'La revue deviendra une vraie séance de brainstorming',
      bad: 'Tout le monde sera épuisé et rien d’utile ne sortira'
    },
    {
      name: 'Revue des exigences',
      good: 'Cette exigence a l’air simple',
      bad: 'L’entreprise veut une peau d’app qui change avec la coque du téléphone'
    },
    {
      name: 'Lire des blogs',
      good: 'Les histoires du jour valent le détour',
      bad: 'La blogosphère déborde d’énergie négative aujourd’hui',
      weekend: true
    },
    {
      name: 'Parcourir des sites d’anime',
      good: 'Faut-il vraiment une raison ?',
      bad: 'La zone de commentaires est pleine de guerriers du clavier',
      weekend: true
    },
    {
      name: 'Jouer à MapleStory Online',
      good: 'Vous pourriez obtenir un équipement 25 étoiles divin',
      bad: 'Sauf si vous voulez fracasser votre ordinateur',
      weekend: true
    }
  ],
  specials: [
    {
      date: 20140214,
      type: 'bad',
      name: 'Rester avec votre partenaire',
      description:
        'La Saint-Valentin punit les célibataires et récompense les couples.'
    }
  ],
  tools: [
    'Coder dans Eclipse',
    'Rédiger des documents dans MS Office',
    'Coder dans Notepad',
    'Windows 8',
    'Linux',
    'macOS',
    'Internet Explorer',
    'Appareil Android',
    'Appareil iOS'
  ],
  varNames: [
    'result',
    'event',
    'payment',
    'expire',
    'bill',
    'each',
    'free',
    'i1',
    'a',
    'virtual',
    'ad',
    'spider',
    'password',
    'pass',
    'ui'
  ],
  drinks: [
    'Eau',
    'Thé',
    'Thé noir',
    'Thé vert',
    'Café',
    'Thé au lait',
    'Cola',
    'Lait frais',
    'Lait de soja',
    'Jus',
    'Soda aux fruits',
    'Eau gazeuse',
    'Boisson sportive',
    'Yaourt',
    'Alcool'
  ]
}
