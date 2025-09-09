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
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'class' => 'qui-presentationBricks-controls-wallpaperText',
            'image-background-fixed' => false,
            'bg-color' => '',
            'imageBackgroundPos' => 'center',
            'fixed' => false,
            'content-position' => 'center',
            'minHeight' => false,
            'contentMaxWidth' => 600,
            'fontColor' => 'inherit',
        ]);

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
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        if ($this->getAttribute('image-background-fixed')) {
            $this->addCSSClass('qui-presentationBricks-controls-wallpaperText--bgImageIsFixed');
        }

        if ($this->getAttribute('minHeight')) {
            $this->setStyle('min-height', $this->getAttribute('minHeight'));
        }

        $bgColor = 'transparent';

        if ($this->getAttribute('bg-color')) {
            $bgColor = $this->getAttribute('bg-color');
        }

        $contentMaxWidth = $this->getAttribute('contentMaxWidth');

        if (is_numeric($contentMaxWidth)) {
            $contentMaxWidth .= 'px';
        }

        $this->setCustomVariable('bgColor', $bgColor);
        $this->setCustomVariable('imageBgPos', $this->getAttribute('imageBackgroundPos'));
        $this->setCustomVariable('contentPos', $this->getAttribute('content-position'));
        $this->setCustomVariable('minHeight', $this->getAttribute('minHeight'));
        $this->setCustomVariable('fontColor', $this->getAttribute('fontColor'));
        $this->setCustomVariable('contentMaxWidth', $contentMaxWidth);

        $Engine->assign([
            'this' => $this,
            'imageBackground' => $this->getAttribute('image-background'),
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/WallpaperText.html');
    }

    /**
     * Set custom css variable to the control as inline style
     * --_qui-presentationBricks-controls-wallpaperText-$name: var(--qui-presentationBricks-controls-wallpaperText-$name, $value);
     *
     * Example:
     *     --_qui-presentationBricks-controls-wallpaperText-bgColor: var(--qui-presentationBricks-controls-wallpaperText-bgColor, #eee);
     *
     * @param string $name
     * @param string $value
     *
     * @return void
     */
    private function setCustomVariable(string $name, string $value): void
    {
        if (!$name || !$value) {
            return;
        }

        $this->setStyle(
            '--_qui-presentationBricks-controls-wallpaperText-' . $name,
            'var(--qui-presentationBricks-controls-wallpaperText-' . $name . ', ' . $value . ')'
        );
    }
}
