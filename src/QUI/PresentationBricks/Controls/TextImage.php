<?php

/**
 * This file contains QUI\PresentationBricks\Controls\TextImage
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class TextImage
 *
 * @package quiqqer/presentation-bricks
 */
class TextImage extends QUI\Control
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
            'image'             => false,
            'backgroundColor'   => false,
            'imageRight'        => false,
            'imageAsBackground' => false,
            'textPosition'      => 'top' // top, center, bottom
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/TextImage.css'
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

        $image = $this->getAttribute('image');

        $Engine->assign([
            'this'              => $this,
            'img'               => $image,
            'backgroundColor'   => $this->getAttribute('backgroundColor'),
            'imageRight'        => $this->getAttribute('imageRight'),
            'imageAsBackground' => $this->getAttribute('imageAsBackground'),
            'textPosition'      => $this->getAttribute('textPosition')
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/TextImage.html');
    }
}
