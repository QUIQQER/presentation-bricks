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
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'imageBackgroundFixed' => 'false',
            'arrowType' => 'arrow-down',
            'fixed' => false,
            'effect' => 'scale'
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/WallpaperTextArrow.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $arrowType = $this->getAttribute('arrow-type');

        $fixed = '';
        if ($this->getAttribute('image-background-fixed')) {
            $fixed = "fixed";
        }

        if ($arrowType !== 'hide') {
            $this->setAttribute(
                'qui-class',
                'package/quiqqer/presentation-bricks/bin/Controls/WallpaperTextArrow'
            );
        }

        $Engine->assign([
            'this' => $this,
            'imageBackground' => $this->getAttribute('image-background'),
            'fixed' => $fixed,
            'image' => $this->getAttribute('image'),
            'arrowType' => $this->getAttribute('arrow-type'),
            'effect' => $this->getAttribute('effect')
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/WallpaperTextArrow.html');
    }
}
