#!/bin/bash
# Source du backup
SRC="~"
# Destination du backup
DST="/media/`whoami`/Backup"
# Date de la forme année-mois-jour-timestamp
# (le timestamp %s sert si on veut faire plusieurs sauvegardes dans la même journée)
DATE=`date +%Y-%m-%d-%s`

# Création du répertoire temporaire
mkdir $DST/tmp || exit 1

echo "Backup commencé le "`date "+%d/%m/%Y à %T"`
echo "Starting : "`date "+%Y-%m-%d %T"` >> $DST/log
echo "Copie de la dernière sauvegarde..."

# Si une sauvegarde a déjà été faite précédemment
if test -d $DST/today ; then
    # Et si le fichier contenant la date de la dernière sauvegarde existe
    if test -f $DST/last_date ; then

        LASTDATE=`cat $DST/last_date`
        # Alors on fait un copie en hardlinks de la sauvegarde d'hier
        cp -al $DST/today $DST/tmp/
        # Puis on renomme la copie pour qu'elle devienne la sauvegarde d'hier
        mv $DST/tmp/today $DST/$LASTDATE

    fi

# Sinon, on crée le premier dossier
else
    mkdir $DST/today
fi

rm -rf $DST/tmp
# On sauvegarde la date actuelle pour le prochain backup
echo $DATE > $DST/last_date

echo "Synchronisation de la sauvegarde du jour..."

# Synchronisation de la source avec le dossier du jour
rsync -ax --delete --size-only --exclude ~francois/dev/geniustrade/log --exclude ~francois/dev/geniustrade/public/uploads/tmp $SRC/ $DST/today/

echo "Backup terminé le "`date "+%d/%m/%Y à %T"`
echo "Done : "`date "+%Y-%m-%d %T"` >> $DST/log
