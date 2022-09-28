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
            'template'        => 'default',
            'centerContent'   => false,
            'entriesPerLine'  => 2,
            'iconSize'        => 'md',
            'imgIconSize'     => 96,
            'imgSquare'       => false,
            'contentPosition' => 'default',
            'contentWidth'    => '30'
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__).'/IconBox.css'
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

        $entries         = json_decode($this->getAttribute('entries'), true);
        $template        = $this->getAttribute('template');
        $centerContent   = $this->getAttribute('centerContent');
        $entriesPerLine  = $this->getAttribute('entriesPerLine');
        $iconSize        = $this->getAttribute('iconSize');
        $imgSquare       = $this->getAttribute('imgSquare');
        $contentPosition = $this->getAttribute('contentPosition');
        $contentWidth    = $this->getAttribute('contentWidth');
        $enabledEntries  = [];

        $imgIconSize = 96;

        if (intval($this->getAttribute('imgIconSize')) >= 0) {
            $imgIconSize = intval($this->getAttribute('imgIconSize'));
        }

        foreach ($entries as $entry) {
            if ($entry['isDisabled'] === 1) {
                continue;
            }

            array_push($enabledEntries, $entry);
        }

        $Engine->assign([
            'this'            => $this,
            'centerContent'   => $centerContent,
            'entriesPerLine'  => $entriesPerLine,
            'iconSize'        => $iconSize,
            'imgIconSize'     => $imgIconSize,
            'imgSquare'       => $imgSquare,
            'entries'         => $enabledEntries,
            'contentPosition' => $contentPosition,
            'contentWidth'    => $contentWidth
        ]);

        return $Engine->fetch(dirname(__FILE__).'/IconBox.'.$template.'.html');
    }
}
