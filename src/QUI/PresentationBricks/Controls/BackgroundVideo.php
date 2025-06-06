<?php

/**
 * This file contains QUI\PresentationBricks\Controls\BackgroundVideo
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class BackgroundVideo
 *
 * @package quiqqer/presentation-bricks
 */
class BackgroundVideo extends QUI\Control
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
            'video' => false,
            'poster' => false,
            'backgroundColor' => '#333',
            'shortVideo' => false,
            'autoplay' => true,
            'muted' => true,
            'loop' => true,
            'playsinline' => true,
            'playIfInView' => true,
            'backgroundVideoBrightness' => 50,
            'fontColor' => '#fff',
            'contentMaxWidth' => false,
            'contentPosition' => 'center',
            'openVideoInPopup' => 'clickOnDefaultButton',
            'defaultButtonPosition' => ''
        ]);

        parent::__construct($attributes);

        $this->setJavaScriptControl('package/quiqqer/presentation-bricks/bin/Controls/BackgroundVideo');

        $this->addCSSFile(
            dirname(__FILE__) . '/BackgroundVideo.css'
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
        $backgroundColor = '#333';
        $autoplay = false;
        $muted = false;
        $loop = false;
        $playsinline = false;
        $backgroundVideoBrightness = 50;
        $fontColor = '#fff';
        $contentMaxWidth = false;
        $defaultBtnPos = '';

        if ($this->getAttribute('backgroundColor')) {
            $backgroundColor = $this->getAttribute('backgroundColor');
        }

        if ($this->getAttribute('autoplay')) {
            $autoplay = $this->getAttribute('autoplay');
        }

        if ($this->getAttribute('muted')) {
            $muted = $this->getAttribute('muted');
        }

        if ($this->getAttribute('loop')) {
            $loop = $this->getAttribute('loop');
        }

        if ($this->getAttribute('playsinline')) {
            $playsinline = $this->getAttribute('playsinline');
        }

        $this->setJavaScriptControlOption('playifinview', $this->getAttribute('playIfInView'));

        if (
            intval($this->getAttribute('backgroundVideoBrightness')) &&
            intval($this->getAttribute('backgroundVideoBrightness')) > 0 &&
            intval($this->getAttribute('backgroundVideoBrightness')) <= 100
        ) {
            $backgroundVideoBrightness = intval($this->getAttribute('backgroundVideoBrightness'));
        }

        $backgroundVideoBrightness = $backgroundVideoBrightness / 100;

        if ($this->getAttribute('fontColor')) {
            $fontColor = $this->getAttribute('fontColor');
        }

        if (
            intval($this->getAttribute('contentMaxWidth')) &&
            intval($this->getAttribute('contentMaxWidth')) > 0
        ) {
            $contentMaxWidth = $this->getAttribute('contentMaxWidth');
        }

        $contentPosition = match ($this->getAttribute('contentPosition')) {
            'top' => 'start',
            'bottom' => 'end',
            default => 'center',
        };

        $initVideoInPopup = false;

        switch ($this->getAttribute('openVideoInPopup')) {
            case 'clickOnDefaultButton':
            case 'clickOnOwnButton':
                $initVideoInPopup = true;
        }

        /**
         * poster url
         */
        $posterUrl = false;

        try {
            $Poster = QUI\Projects\Media\Utils::getImageByUrl($this->getAttribute('poster'));
            $posterUrl = $Poster->getUrl(true);
        } catch (QUI\Exception) {
            // nothing
        }

        if ($initVideoInPopup) {
            if ($posterUrl) {
                $this->setJavaScriptControlOption('poster', $posterUrl);
            }

            try {
                $Video = QUI\Projects\Media\Utils::getMediaItemByUrl($this->getAttribute('video'));
                $this->setJavaScriptControlOption('video', $Video->getUrl(true));
            } catch (QUI\Exception) {
                // nothing
            }
        }

        $this->setJavaScriptControlOption('openInPopup', intval($initVideoInPopup));

        if ($this->getAttribute('defaultButtonPosition')) {
            $defaultBtnPos = $this->getAttribute('defaultButtonPosition');
        }

        $Engine->assign([
            'this' => $this,
            'posterUrl' => $posterUrl,
            'backgroundColor' => $backgroundColor,
            'autoplay' => $autoplay,
            'muted' => $muted,
            'loop' => $loop,
            'playsinline' => $playsinline,
            'backgroundVideoBrightness' => $backgroundVideoBrightness,
            'fontColor' => $fontColor,
            'contentMaxWidth' => $contentMaxWidth,
            'contentPosition' => $contentPosition,
            'defaultBtnPos' => $defaultBtnPos,
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/BackgroundVideo.html');
    }
}
