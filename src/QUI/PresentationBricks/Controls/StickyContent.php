<?php

/**
 * This file contains QUI\PresentationBricks\Controls\StickyContent
 */

namespace QUI\PresentationBricks\Controls;

use Exception;
use QUI;
use QUI\Projects\Site\Utils;

/**
 * Class StickyContent
 *
 * @package quiqqer/presentation-bricks
 */
class StickyContent extends QUI\Control
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
            'class' => 'qui-control-brick',
            'limit' => 5,
            'order' => 'c_date DESC',
            'parentInputList' => false,
            'template' => 'default',
            'quiClass' => 'package/quiqqer/presentation-bricks/bin/Controls/StickyContentDefault',
            'imgagMockup' => ''

        ]);

        parent::__construct($attributes);
    }

    /**
     * (non-PHPdoc)
     *
     * @throws Exception
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $start = 0;
        $limit = $this->getAttribute('limit');
        $Project = $this->getProject();


        if (!$limit) {
            $limit = 5;
        }

        $children = Utils::getSitesByInputList($Project, $this->getAttribute('site'), [
            'where' => $this->getAttribute('where'),
            'limit' => $start . ',' . $limit,
            'order' => $this->getAttribute('order')
        ]);


        $template = $this->getAttribute('template');

        switch ($template) {
            case 'simple':
            default:
                $html = dirname(__FILE__) . '/StickyContent.Default.html';
                $css = dirname(__FILE__) . '/StickyContent.Default.css';
                $quiClass = 'package/quiqqer/presentation-bricks/bin/Controls/StickyContentDefault';
                break;
            case 'mockup':
                $html = dirname(__FILE__) . '/StickyContent.MockUp.html';
                $css = dirname(__FILE__) . '/StickyContent.MockUp.css';
                $quiClass = 'package/quiqqer/presentation-bricks/bin/Controls/StickyContentMockUp';
                break;
        }

        $mockup = $this->getAttribute('imgagMockup') . '.png';
        $mockupUrl = 'quiqqer/presentation-bricks/bin/img/';

        $Engine->assign([
            'this' => $this,
            'Site' => $this->getSite(),
            'Project' => $this->getProject(),
            'children' => $children,
            'inlineStyle' => 'opacity: 1;',
            'imageMockupUrl' => URL_OPT_DIR . $mockupUrl . $mockup
        ]);

        $this->addCSSFile($css);
        $this->setAttribute('qui-class', $quiClass);

        return $Engine->fetch($html);
    }

    /**
     * Check if the limit can execute
     *
     * @throws QUI\Exception
     */
    public function checkLimit(): void
    {
        $Site = $this->getSite();

        if (!$Site) {
            return;
        }

        $sheet = 1;
        $limit = $this->getAttribute('limit');

        if (!$limit) {
            $limit = 2;
        }

        if (isset($_REQUEST['sheet'])) {
            $sheet = (int)$_REQUEST['sheet'];
        }

        $count_children = $Site->getChildren([
            'count' => 'count'
        ]);

        $sheets = ceil($count_children / $limit);

        if ($sheets < $sheet || $sheet < 0) {
            throw new QUI\Exception('Sites not found', 404);
        }
    }

    /**
     * @return mixed|QUI\Projects\Site
     * @throws QUI\Exception
     */
    protected function getSite(): mixed
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        $Site = QUI::getRewrite()->getSite();

        $this->setAttribute('Site', $Site);

        return $Site;
    }
}
