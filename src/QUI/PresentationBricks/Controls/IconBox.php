<?php

/**
 * This file contains QUI\PresentationBricks\Controls\IconBox
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class WallpaperTextArrow
 *
 * @package quiqqer/presentation-bricks
 */
class IconBox extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'template'       => 'default',
            'centerContent'  => false,
            'entriesPerLine' => 2,
            'iconSize'       => 'small',
            'imgIconSize'    => '50px'
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/IconBox.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $entries        = json_decode($this->getAttribute('entries'), true);
        $template       = $this->getAttribute('template');
        $centerContent  = $this->getAttribute('centerContent');
        $entriesPerLine = $this->getAttribute('entriesPerLine');
        $iconSize       = $this->getAttribute('iconSize');
        $imgIconSize    = $this->getAttribute('imgIconSize');
        $enabledEntries = [];

        foreach ($entries as $entry) {
            if ($entry['isDisabled'] === 1) {
                continue;
            }

            array_push($enabledEntries, $entry);
        }

        $Engine->assign([
            'this'           => $this,
            'centerContent'  => $centerContent,
            'entriesPerLine' => $entriesPerLine,
            'iconSize'       => $iconSize,
            'imgIconSize'    => $imgIconSize,
            'entries'        => $enabledEntries
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/IconBox.' . $template . '.html');
    }
}
