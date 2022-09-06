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

        $Engine->assign([
            'this' => $this
        ]);

        return $Engine->fetch(dirname(__FILE__).'/IconBox.html');
    }
}
