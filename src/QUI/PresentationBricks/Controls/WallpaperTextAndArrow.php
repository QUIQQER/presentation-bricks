<?php

/**
 * This file contains QUI\PresentationBricks\Controls\WallpaperTextAndArrow
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class WallpaperTextAndArrow
 *
 * @package quiqqer/presentation-bricks
 */
class WallpaperTextAndArrow extends QUI\Control
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
            'arrow-type' => 'standard'
        ));

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/WallpaperTextAndArrow.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine     = QUI::getTemplateManager()->getEngine();
        $arrowType = $this->getAttribute('arrow-type');

        $Engine->assign(array(
            'this'       => $this,
            'arrowType' => $arrowType
        ));

        return $Engine->fetch(dirname(__FILE__) . '/WallpaperTextAndArrow.html');
    }
}
