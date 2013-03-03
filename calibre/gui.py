# preferences for the calibre GUI

### Begin group: DEFAULT
 
# send to storage card by default
# Par défaut, envoyer le fichier dans la carte mémoire à la place de la mémoire principale
send_to_storage_card_by_default = False
 
# confirm delete
# Confirmer avant la suppression
confirm_delete = False
 
# main window geometry
# Géométrie de l’écran principal
main_window_geometry = cPickle.loads('\x80\x02csip\n_unpickle_type\nq\x01U\x0cPyQt4.QtCoreq\x02U\nQByteArrayU.\x01\xd9\xd0\xcb\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x06?\x00\x00\x03o\x00\x00\x00\x00\x00\x00\x00\x00\xff\xff\xff\xfe\xff\xff\xff\xfe\x00\x00\x00\x00\x02\x00\x85\x87Rq\x03.')
 
# new version notification
# Avertir lorsqu’une nouvelle version est disponible
new_version_notification = True
 
# use roman numerals for series number
# Utiliser les chiffres romains pour les numéros de séries
use_roman_numerals_for_series_number = True
 
# sort tags by
# Trier la liste d’étiquettes par nom, popularité ou note (classement)
sort_tags_by = 'name'
 
# match tags type
# Faire correspondre les étiquettes par n’importe laquelle ou toutes.
match_tags_type = 'any'
 
# cover flow queue length
# Nombre de couvertures à afficher dans le mode de navigation par couverture
cover_flow_queue_length = 6
 
# LRF conversion defaults
# Valeurs par défaut pour la conversion vers LRF
LRF_conversion_defaults = cPickle.loads('\x80\x02]q\x01.')
 
# LRF ebook viewer options
# Options pour le visionneur de livre numérique LFR
LRF_ebook_viewer_options = None
 
# internally viewed formats
# Formats qui sont affichés par le visionneur interne
internally_viewed_formats = cPickle.loads('\x80\x02]q\x01(X\x03\x00\x00\x00AZWq\x02X\x04\x00\x00\x00AZW3q\x03X\x04\x00\x00\x00EPUBq\x04X\x03\x00\x00\x00FB2q\x05X\x04\x00\x00\x00HTMLq\x06X\x05\x00\x00\x00HTMLZq\x07X\x03\x00\x00\x00LITq\x08X\x03\x00\x00\x00LRFq\tX\x04\x00\x00\x00MOBIq\nX\x03\x00\x00\x00PDBq\x0bX\x04\x00\x00\x00POBIq\x0cX\x03\x00\x00\x00PRCq\rX\x02\x00\x00\x00RBq\x0eX\x03\x00\x00\x00SNBq\x0fe.')
 
# column map
# Colonnes affichées dans la liste de livres
column_map = cPickle.loads('\x80\x02]q\x01(U\x05titleq\x02U\x08ondeviceq\x03U\x07authorsq\x04U\x04sizeq\x05U\ttimestampq\x06U\x06ratingq\x07U\tpublisherq\x08U\x04tagsq\tU\x06seriesq\nU\x07pubdateq\x0be.')
 
# autolaunch server
# Démarrer automatiquement le serveur de contenu au démarrage de l’application
autolaunch_server = False
 
# oldest news
# Anciennes informations conservées dans la base de données
oldest_news = 60
 
# systray icon
# Afficher l’icône dans la zone de notification
systray_icon = False
 
# upload news to device
# Envoyer les informations téléchargées vers l’appareil
upload_news_to_device = True
 
# delete news from library on upload
# Effacer les nouveaux livres de la bibliothèque après l’envoi à l’appareil
delete_news_from_library_on_upload = False
 
# separate cover flow
# Afficher la navigation par couverture dans une fenêtre séparée au lieu de la fenêtre principale de Calibre.
separate_cover_flow = False
 
# disable tray notification
# Désactiver les alertes dans la zone de notification
disable_tray_notification = False
 
# default send to device action
# Action par défaut à réaliser quand le bouton « envoyer au lecteur » est cliqué
default_send_to_device_action = 'DeviceAction:main::False:False'
 
# asked library thing password
# Asked library thing password at least once.
asked_library_thing_password = False
 
# search as you type
# Démarrer la recherche lors de la frappe. Si c’est désactivé alors la recherche n’aura lieu que lorsque la touche Enter ou Return sera pressée.
search_as_you_type = False
 
# highlight search matches
# Lors d’une recherche, montrer tous les livres avec les résultats de la recherche mis en évidence au lieu de montrer uniquement les résultats. Vous pouvez utiliser N ou la touche F3 pour vous déplacer jusqu’au résultat suivant.
highlight_search_matches = False
 
# save to disk template history
# Previously used Save to Disk templates
save_to_disk_template_history = cPickle.loads('\x80\x02]q\x01.')
 
# send to device template history
# Previously used Send to Device templates
send_to_device_template_history = cPickle.loads('\x80\x02]q\x01.')
 
# main search history
# Search history for the main GUI
main_search_history = cPickle.loads('\x80\x02]q\x01.')
 
# viewer search history
# Search history for the ebook viewer
viewer_search_history = cPickle.loads('\x80\x02]q\x01X\x05\x00\x00\x00cloneq\x02a.')
 
# lrf viewer search history
# Search history for the LRF viewer
lrf_viewer_search_history = cPickle.loads('\x80\x02]q\x01.')
 
# scheduler search history
# Search history for the recipe scheduler
scheduler_search_history = cPickle.loads('\x80\x02]q\x01.')
 
# plugin search history
# Search history for the plugin preferences
plugin_search_history = cPickle.loads('\x80\x02]q\x01.')
 
# shortcuts search history
# Search history for the keyboard preferences
shortcuts_search_history = cPickle.loads('\x80\x02]q\x01.')
 
# jobs search history
# Search history for the keyboard preferences
jobs_search_history = cPickle.loads('\x80\x02]q\x01.')
 
# tweaks search history
# Search history for tweaks
tweaks_search_history = cPickle.loads('\x80\x02]q\x01.')
 
# worker limit
# Nombre maximum de travaux de téléchargement et de conversions d’informations simultanés. Ce nombre est le double de la valeur actuelle pour des raisons historiques.
worker_limit = 6
 
# get social metadata
# Télécharger les métadonnées sociales (étiquettes, classement, etc.)
get_social_metadata = True
 
# overwrite author title metadata
# Remplacer l’auteur et le titre avec de nouvelles métadonnées
overwrite_author_title_metadata = True
 
# auto download cover
# Télécharger automatiquement la couverture, si celle-ci est disponible
auto_download_cover = False
 
# enforce cpu limit
# Limiter le nombre maximum de travaux simultanés au nombre de processeurs
enforce_cpu_limit = True
 
# gui layout
# La couche de l’interface utilisateur. En mode large (wide), elle a le panneau de détails du livre sur la droite, et en mode réduit (narrow), elle l’a en bas.
gui_layout = 'wide'
 
# show avg rating
# Afficher la note moyenne par article dans le navigateur d’étiquettes
show_avg_rating = True
 
# disable animations
# Désactiver les animations de IU
disable_animations = False
 
# tag browser hidden categories
# catégories du navigateur d’étiquettes à ne pas afficher
tag_browser_hidden_categories = cPickle.loads('\x80\x02c__builtin__\nset\nq\x01]\x85Rq\x02.')
 


