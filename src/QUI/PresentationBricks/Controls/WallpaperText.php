<?php

/**
 * This file contains QUI\PresentationBricks\Controls\WallpaperText
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class WallpaperText
 *
 * @package quiqqer/presentation-bricks
 */
class WallpaperText extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'contentPosition' => 'left'
        ));

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/WallpaperText.css'
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

        $Engine->assign(array(
            'this'            => $this,
            'imageBackground' => $this->getAttribute('image-background'),
            'contentPosition' => $this->getAttribute('content-position'),
//            'height'          => $this->getAttribute('height')
        ));

        return $Engine->fetch(dirname(__FILE__) . '/WallpaperText.html');
    }
}
