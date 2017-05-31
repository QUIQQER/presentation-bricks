<?php

/**
 * This file contains QUI\PresentationBricks\Controls\WallpaperTextArrow
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class WallpaperTextArrow
 *
 * @package quiqqer/presentation-bricks
 */
class WallpaperTextArrow extends QUI\Control
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
            'arrowType' => 'arrow-down',
            'effect'    => 'scale'
        ));

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/WallpaperTextArrow.css'
        );

        $this->setAttribute(
            'qui-class',
            'package/quiqqer/presentation-bricks/bin/Controls/WallpaperTextArrow'
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
            'image'           => $this->getAttribute('image'),
            'arrowType'       => $this->getAttribute('arrow-type'),
            'effect'          => $this->getAttribute('effect')
        ));

        return $Engine->fetch(dirname(__FILE__) . '/WallpaperTextArrow.html');
    }
}
