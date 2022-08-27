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
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'imageBackgroundFixed' => false,
            'bgColor'              => '#eee',
            'imageBackgroundPos'   => 'center',
            'fixed'                => false,
            'contentPosition'      => 'flex-start',
            'minHeight'            => false,
            'contentMaxWidth'      => 600,
            'fontColor'            => 'inherit',
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__).'/WallpaperText.css'
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

        $fixed = '';
        if ($this->getAttribute('image-background-fixed')) {
            $fixed = "fixed";
        }

        if ($this->getAttribute('minHeight')) {
            $this->setStyle('min-height', $this->getAttribute('minHeight'));
        }

        $bgColor = '#eee';

        if ($this->getAttribute('bg-color')) {
            $bgColor = $this->getAttribute('bg-color');
        }

        $Engine->assign([
            'this'            => $this,
            'imageBackground' => $this->getAttribute('image-background'),
            'bgColor'         => $bgColor,
            'fixed'           => $fixed,
            'contentPosition' => $this->getAttribute('content-position')
        ]);

        return $Engine->fetch(dirname(__FILE__).'/WallpaperText.html');
    }
}
